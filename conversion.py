'''
Compact encoding.
'''
def encode(i):
    # Convert integer to a hex string with the correct prefix depending on the size of the integer
    if i <= 252:
        compactsize = i.to_bytes(1, byteorder='little').hex()
    elif 252 < i <= 65535:
        compactsize = 'fd' + i.to_bytes(2, byteorder='little').hex()
    elif 65535 < i <= 4294967295:
        compactsize = 'fe' + i.to_bytes(4, byteorder='little').hex()
    elif 4294967295 < i <= 18446744073709551615:
        compactsize = 'ff' + i.to_bytes(8, byteorder='little').hex()

    return compactsize

def decode(compactsize):
    # Get the first byte
    first = compactsize[0:2]

    # Get the correct number of bytes from the hex string, then convert this hex string to an integer
    if first == "fd":
        i = int.from_bytes(bytes.fromhex(compactsize[2:6]), byteorder='little')
    elif first == "fe":
        i = int.from_bytes(bytes.fromhex(compactsize[2:10]), byteorder='little')
    elif first == "ff":
        i = int.from_bytes(bytes.fromhex(compactsize[2:18]), byteorder='little')
    else:
        i = int.from_bytes(bytes.fromhex(compactsize[0:2]), byteorder='little')

    return i

