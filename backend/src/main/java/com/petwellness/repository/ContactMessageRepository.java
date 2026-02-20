package com.petwellness.repository;

import com.petwellness.model.ContactMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ContactMessage entity.
 */
@Repository
public interface ContactMessageRepository extends MongoRepository<ContactMessage, String> {
}
