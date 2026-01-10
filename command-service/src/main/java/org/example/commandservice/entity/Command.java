package org.example.commandservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@AllArgsConstructor @NoArgsConstructor @Getter @Setter
public class Command {
    @Id
    private String id;
    private LocalDateTime date;
    private String status;
    private double amount;
    private String clientId;
    @OneToMany(mappedBy = "command")
    private List<CommandProduct> products;
}