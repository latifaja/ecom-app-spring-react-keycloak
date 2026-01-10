package org.example.commandservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class CommandProduct {
    @Id
    private String id;
    @ManyToOne
    private Command command;
    private String productId;
    private int quantity;
    @Transient
    private Product product;
}