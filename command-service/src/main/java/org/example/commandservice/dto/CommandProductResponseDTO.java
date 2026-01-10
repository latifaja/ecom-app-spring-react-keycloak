package org.example.commandservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.commandservice.entity.Product;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandProductResponseDTO {
    private String id;
    private Product product;
    private int quantity;
}