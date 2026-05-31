package com.locafy.payment.repository;

import com.locafy.payment.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    Page<Transaction> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);
}
