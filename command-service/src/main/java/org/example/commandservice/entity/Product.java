package org.example.commandservice.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Product {
    private String id;
    private String name;
    private String description;
    private double price;
    private int quantity;
}
