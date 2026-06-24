package com.rnt.rent;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class MongoConfigTest {

    @Test
    public void testRegex() {
        String s = "Siddharth Shivwanshi";
        assertEquals("Siddharth_Shivwanshi", s.replaceAll("[^a-zA-Z0-9_-]", "_"));
    }
}
