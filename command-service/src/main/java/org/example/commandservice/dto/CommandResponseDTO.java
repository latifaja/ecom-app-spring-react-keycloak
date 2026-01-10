package org.example.commandservice.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandResponseDTO {
    private String id;
    private LocalDateTime date;
    private String status;
    private double amount;

    private List<CommandProductResponseDTO> products;
}