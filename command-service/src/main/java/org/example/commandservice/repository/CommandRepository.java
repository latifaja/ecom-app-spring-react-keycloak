package org.example.commandservice.repository;

import org.example.commandservice.entity.Command;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command, String> {
    List<Command> findByClientId(String clientId);
}