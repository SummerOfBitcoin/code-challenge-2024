import re

def is_valid_scriptpubkey_asm(scriptpubkey_asm):
    
    pattern = r'^OP_[A-Z0-9_]+( [A-Fa-f0-9]+)*$'
    
   
    return re.match(pattern, scriptpubkey_asm) is not None


scriptpubkey_asm = 'OP_PUSHBYTES_20'


print(is_valid_scriptpubkey_asm(scriptpubkey_asm))
