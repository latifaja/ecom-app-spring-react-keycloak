package org.example.commandservice.controller;

import org.example.commandservice.dto.CommandRequestDTO;
import org.example.commandservice.dto.CommandResponseDTO;
import org.example.commandservice.service.CommandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/commands")
public class CommandController {

    private final CommandService commandService;

    public CommandController(CommandService commandService) {
        this.commandService = commandService;
    }

    @PostMapping
    public ResponseEntity<CommandResponseDTO> createCommand(@RequestBody CommandRequestDTO commandRequestDTO) {
        CommandResponseDTO createdCommand = commandService.createCommand(commandRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCommand);
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<CommandResponseDTO> updateCommand(
//            @PathVariable String id,
//            @RequestBody CommandRequestDTO commandRequestDTO) {
//        CommandResponseDTO updatedCommand = commandService.updateCommand(id, commandRequestDTO);
//        return ResponseEntity.ok(updatedCommand);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteCommand(@PathVariable String id) {
//        commandService.deleteCommand(id);
//        return ResponseEntity.noContent().build();
//    }

    @GetMapping
    public ResponseEntity<List<CommandResponseDTO>> getAllCommands() {
        List<CommandResponseDTO> commands = commandService.getAllCommands();
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandResponseDTO> getCommandById(@PathVariable String id) {
        CommandResponseDTO command = commandService.getCommandById(id);
        return ResponseEntity.ok(command);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<CommandResponseDTO>> getCommandsByClientId(@PathVariable String clientId) {
        List<CommandResponseDTO> commands = commandService.getCommandsByClientId(clientId);
        return ResponseEntity.ok(commands);
    }
}