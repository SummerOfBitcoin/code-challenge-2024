import base58
import hashlib
import binascii 
from binascii import hexlify
#from pycoin.encoding import bitcoin_address_to_hash160_sec, hash160_sec_to_bitcoin_address,bitcoin_address_to_hash160_sec_with_prefix

def is_base58(s):
    try:
        base58.b58decode(s)
        return True
    except (binascii.Error):
        return False

def decode_base58(s):
    return base58.b58decode(s)

def validate_checksum(decoded):
    checksum = hashlib.sha256(hashlib.sha256(decoded[:-4]).digest()).digest()[:4]
    return decoded[-4:] == checksum

def validate_address_format(address):
    if address.startswith('bc1'):
        try:
            base58.b58decode(address)  # Attempting to decode Bech32 address will raise an error
            return False
        except (binascii.Error, ValueError):
            return True
    if not is_base58(address):
        return False
    decoded = decode_base58(address)
    if not validate_checksum(decoded):
        return False
    return True

def hash160(s):
    return hashlib.new('ripemd160', hashlib.sha256(s).digest()).digest()



def validate_address(address):
    if not validate_address_format(address):
        return False, "Invalid address format"
    
    
    
    
    
    return True

# Example Bitcoin addresses
addresses = [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # P2PKH address
    "37jAAWEdJ9D9mXybRobcveioxSkt7Lkwog",  # P2SH address
    "bc1ptz84y6zl5a88rwrvrgjkdytztlm9ahw4paq2ukqadgzypvc3wklqspzmw7"  # Bech32 address
]

for address in addresses:
    is_valid = validate_address(address)
    print(f"Address: {address}, Valid: {is_valid}")

'''import base58
import hashlib
from binascii import hexlify
from bitcoinlib.keys import P2PKHBitcoinAddress, P2SHBitcoinAddress

def is_base58(s):
    try:
        base58.b58decode(s)
        return True
    except binascii.Error:
        return False

def decode_base58(s):
    return base58.b58decode(s)

def validate_checksum(decoded):
    checksum = hashlib.sha256(hashlib.sha256(decoded[:-4]).digest()).digest()[:4]
    return decoded[-4:] == checksum

def validate_address_format(address):
    if not is_base58(address):
        return False
    decoded = decode_base58(address)
    if not validate_checksum(decoded):
        return False
    return True

def address_to_hash160(address):
    try:
        return P2PKHBitcoinAddress(address).hash160()
    except ValueError:
        return P2SHBitcoinAddress(address).hash160()

def hash160_to_address(hash160):
    # Assuming hash160 is bytes, convert it to hexadecimal string
    hex_hash160 = hash160.hex()
    return P2PKHBitcoinAddress.from_hash160(hex_hash160).address()

def validate_address(address):
    if not validate_address_format(address):
        return False, "Invalid address format"
    
    hash160_sec = address_to_hash160(address)
    reconstructed_address = hash160_to_address(hash160_sec)
    if address != reconstructed_address:
        return False, "Failed address reconstruction"
    
    return True

# Example Bitcoin addresses
addresses = [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # P2PKH address
    "3Kd6oM6fX27uEah23Dm9SwJi1eQ2b5Ej3C",  # P2SH address
    "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"  # Bech32 address
]

for address in addresses:
    is_valid = validate_address(address)
    print(f"Address: {address}, Valid: {is_valid}")
'''