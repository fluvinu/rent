package com.rnt.rent.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.util.Map;

@Service
public class ScriptService {

    private static final Logger log = LoggerFactory.getLogger(ScriptService.class);
    private final ScriptEngine engine;

    public ScriptService() {
        ScriptEngineManager manager = new ScriptEngineManager();
        // Uses GraalVM JavaScript or Nashorn if available. Fallback to basic if JS not found.
        this.engine = manager.getEngineByName("javascript");
        if (this.engine == null) {
            log.warn("JavaScript script engine not found! Custom SCRIPT actions will fail.");
        }
    }

    public void executeScript(String script, Map<String, Object> data) {
        if (engine == null) {
            log.error("Cannot execute script because JavaScript engine is missing.");
            return;
        }

        try {
            // Bind the record data to a "record" variable in the script
            engine.put("record", data);
            // Disable Java host access in GraalVM to prevent RCE
            engine.put("polyglot.js.allowHostAccess", false);
            engine.put("polyglot.js.allowHostClassLookup", false);
            engine.eval(script);
        } catch (ScriptException e) {
            log.error("Failed to execute workflow SCRIPT action: {}", e.getMessage());
        }
    }
}
