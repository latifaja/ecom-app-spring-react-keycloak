package org.example.commandservice.service;

import lombok.AllArgsConstructor;
import org.example.commandservice.dto.CommandProductDTO;
import org.example.commandservice.dto.CommandProductResponseDTO;
import org.example.commandservice.dto.CommandRequestDTO;
import org.example.commandservice.dto.CommandResponseDTO;
import org.example.commandservice.dto.QuantityChangeDTO;
import org.example.commandservice.feign.ProductRestClient;
import org.example.commandservice.entity.Command;
import org.example.commandservice.entity.CommandProduct;
import org.example.commandservice.entity.Product;
import org.example.commandservice.repository.CommandProductRepository;
import org.example.commandservice.repository.CommandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class CommandService {

    private final CommandRepository commandRepository;
    private final CommandProductRepository commandProductRepository;
    private final ProductRestClient productRestClient;

    public CommandResponseDTO createCommand(CommandRequestDTO commandRequestDTO) {
        Command command = new Command();
        command.setId(UUID.randomUUID().toString());
        command.setDate(LocalDateTime.now());
        command.setStatus("PENDING");
        command.setAmount(0.0);


        double totalAmount = 0.0;

        // Calculate total amount and validate products
        for (CommandProductDTO productDTO : commandRequestDTO.getProducts()) {
            Product product = productRestClient.findProductById(productDTO.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found with id: " + productDTO.getProductId());
            }
            // Validate that ordered quantity doesn't exceed available quantity
            if (productDTO.getQuantity() > product.getQuantity()) {
                throw new RuntimeException(
                        String.format("Insufficient quantity for product '%s' (id: %s). Available: %d, Requested: %d",
                                product.getName(), product.getId(), product.getQuantity(), productDTO.getQuantity())
                );
            }
            totalAmount += product.getPrice() * productDTO.getQuantity();
        }

        command.setAmount(totalAmount);
        Command savedCommand = commandRepository.save(command);

        // Create and save command products
        for (CommandProductDTO productDTO : commandRequestDTO.getProducts()) {
            Product product = productRestClient.findProductById(productDTO.getProductId());
            CommandProduct commandProduct = new CommandProduct();
            commandProduct.setId(UUID.randomUUID().toString());
            commandProduct.setCommand(savedCommand);
            commandProduct.setProductId(productDTO.getProductId());
            commandProduct.setQuantity(productDTO.getQuantity());
            commandProduct.setProduct(product);
            commandProductRepository.save(commandProduct);

            // Update product quantity in product service (decrease by the ordered quantity)
            QuantityChangeDTO quantityChange = QuantityChangeDTO.builder()
                    .quantityChange(-productDTO.getQuantity())
                    .build();
            productRestClient.updateProductQuantity(productDTO.getProductId(), quantityChange);
        }

        return mapToResponseDTO(savedCommand);
    }

    public CommandResponseDTO updateCommand(String id, CommandRequestDTO commandRequestDTO) {
        Command command = commandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Command not found with id: " + id));

        // Delete existing command products
        List<CommandProduct> existingProducts = commandProductRepository.findAll().stream()
                .filter(cp -> cp.getCommand().getId().equals(id))
                .collect(Collectors.toList());
        commandProductRepository.deleteAll(existingProducts);

        // Create new command products
        double totalAmount = 0.0;
        for (CommandProductDTO productDTO : commandRequestDTO.getProducts()) {
            Product product = productRestClient.findProductById(productDTO.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found with id: " + productDTO.getProductId());
            }

            CommandProduct commandProduct = new CommandProduct();
            commandProduct.setId(UUID.randomUUID().toString());
            commandProduct.setCommand(command);
            commandProduct.setProductId(productDTO.getProductId());
            commandProduct.setQuantity(productDTO.getQuantity());
            commandProduct.setProduct(product);
            commandProductRepository.save(commandProduct);

            totalAmount += product.getPrice() * productDTO.getQuantity();
        }

        command.setAmount(totalAmount);
        Command updatedCommand = commandRepository.save(command);
        return mapToResponseDTO(updatedCommand);
    }

    public void deleteCommand(String id) {
        if (!commandRepository.existsById(id)) {
            throw new RuntimeException("Command not found with id: " + id);
        }

        // Delete associated command products
        List<CommandProduct> commandProducts = commandProductRepository.findAll().stream()
                .filter(cp -> cp.getCommand().getId().equals(id))
                .collect(Collectors.toList());
        commandProductRepository.deleteAll(commandProducts);

        commandRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CommandResponseDTO> getAllCommands() {
        return commandRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommandResponseDTO getCommandById(String id) {
        Command command = commandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Command not found with id: " + id));
        return mapToResponseDTO(command);
    }

    private CommandResponseDTO mapToResponseDTO(Command command) {
        List<CommandProductResponseDTO> productDTOs = commandProductRepository.findAll().stream()
                .filter(cp -> cp.getCommand().getId().equals(command.getId()))
                .map(cp -> {
                    Product product = productRestClient.findProductById(cp.getProductId());
                    cp.setProduct(product);
                    return CommandProductResponseDTO.builder()
                            .id(cp.getId())
                            .product(product)
                            .quantity(cp.getQuantity())
                            .build();
                })
                .collect(Collectors.toList());

        return CommandResponseDTO.builder()
                .id(command.getId())
                .date(command.getDate())
                .status(command.getStatus())
                .amount(command.getAmount())
                .products(productDTOs)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CommandResponseDTO> getCommandsByClientId(String clientId) {
        return commandRepository.findByClientId(clientId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
}