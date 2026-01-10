package org.example.commandservice.repository;

import org.example.commandservice.entity.CommandProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandProductRepository extends JpaRepository<CommandProduct, String> {
}