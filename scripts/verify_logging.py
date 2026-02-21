import os
import sys
import logging
import time

# ajout du chemin pour importer notre configuration de logger
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from logger_config import setup_logger, LOG_FILE

#test du logger pour vérifier que les logs sont correctement écrits dans le fichier
logger = setup_logger("test_logger")

print(f"Log file should be at: {LOG_FILE}")

logger.info("Test log message from verification script.")

# vérifie que le fichier de log a été créé et que le message a été écrit
if os.path.exists(LOG_FILE):
    print("Log file exists.")
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        print("Log file content preview:")
        print(content[-500:]) 
        
        if "Test log message from verification script." in content:
            print("SUCCESS: Log message found in file.")
        else:
            print("FAILURE: Log message NOT found in file.")
else:
    print("FAILURE: Log file does not exist.")
