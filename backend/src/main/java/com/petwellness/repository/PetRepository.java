package com.petwellness.repository;

import com.petwellness.model.Pet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Pet entity.
 */
@Repository
public interface PetRepository extends MongoRepository<Pet, String> {
    
    /**
     * Find all pets belonging to a specific owner.
     * @param ownerId the owner's user ID
     * @return list of pets
     */
    List<Pet> findByOwnerId(String ownerId);
}
