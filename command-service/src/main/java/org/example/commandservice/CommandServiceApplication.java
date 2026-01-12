package org.example.commandservice;

import org.example.commandservice.dto.CommandProductDTO;
import org.example.commandservice.dto.CommandRequestDTO;
import org.example.commandservice.entity.Product;
import org.example.commandservice.feign.ProductRestClient;
import org.example.commandservice.repository.CommandRepository;
import org.example.commandservice.service.CommandService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EnableFeignClients
public class CommandServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommandServiceApplication.class, args);
	}
	@Bean
	CommandLineRunner initDatabase(CommandService commandService,
								   CommandRepository commandRepository,
								   ProductRestClient productRestClient) {
		return args -> {
			if (commandRepository.count() == 0) {
				try {
					// Fetch products from product-service
					List<Product> products = productRestClient.findAllProducts();

					if (products != null && !products.isEmpty()) {
						// Create first command with first product
						if (products.size() > 0) {
							CommandRequestDTO command1 = CommandRequestDTO.builder()
									.products(List.of(
											CommandProductDTO.builder()
													.productId(products.get(0).getId())
													.quantity(2)
													.build()
									))
									.build();
							commandService.createCommand(command1);
						}

						// Create second command with multiple products
						if (products.size() >= 2) {
							List<CommandProductDTO> commandProducts = new ArrayList<>();
							commandProducts.add(CommandProductDTO.builder()
									.productId(products.get(0).getId())
									.quantity(1)
									.build());
							commandProducts.add(CommandProductDTO.builder()
									.productId(products.get(1).getId())
									.quantity(3)
									.build());

							CommandRequestDTO command2 = CommandRequestDTO.builder()
									.products(commandProducts)
									.build();
							commandService.createCommand(command2);
						}

						// Create third command with multiple products
						if (products.size() >= 3) {
							List<CommandProductDTO> commandProducts = new ArrayList<>();
							commandProducts.add(CommandProductDTO.builder()
									.productId(products.get(1).getId())
									.quantity(2)
									.build());
							if (products.size() >= 3) {
								commandProducts.add(CommandProductDTO.builder()
										.productId(products.get(2).getId())
										.quantity(1)
										.build());
							}

							CommandRequestDTO command3 = CommandRequestDTO.builder()
									.products(commandProducts)
									.build();
							commandService.createCommand(command3);
						}

						System.out.println(" success!");
					} else {
						System.out.println("No products available from product-service.");
					}
				} catch (Exception e) {
					System.out.println("Error fetching products from product-service: " + e.getMessage());
					System.out.println("Skipping  command data insertion.");
				}
			} else {
				System.out.println("Database already contains commands. ");
			}
		};
	}
}