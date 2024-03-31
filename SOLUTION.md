## Design Approach

    OutLine of Blockchain.
    Outputs are tied to transaction identifiers (TXIDs), which are the hashes of signed transactions.

    Because each output of a particular transaction can only be spent once, 
    the outputs of all transactions included in the block chain can be categorized as either Unspent Transaction Outputs (UTXOs) or spent transaction outputs.
    For a payment to be valid, it must only use UTXOs as inputs.




    if the value of a transaction’s outputs exceed its inputs, the transaction will be rejected—but if the inputs exceed the value of the outputs, 
    any difference in value may be claimed as a transaction fee by the Bitcoin miner who creates the block containing that transaction



    New blocks will only be added to the block chain if 
    their hash is at least as challenging as a difficulty value expected by the consensus protocol



    The target threshold is a 256-bit unsigned integer which a header hash must be equal 
    to or below in order for that header to be a valid part of the block chain. 



    Under current consensus rules, a block is not valid unless its serialized
    size is less than or equal to 1 MB


    verifying transaction.

    Transaction validation is the process of verifying that a transaction
    is valid and that it has been correctly included in the blockchain


    This is done by checking the digital signatures of the parties involved in the transaction,
    as well as the validity of the transaction itself




Verify the transaction inputs:

    Retrieve the transaction referenced by the txid in the vin field.
    Verify that the referenced transaction output (vout) exists and has not been spent.
    Verify that the scriptSig in the input unlocks the referenced output. This involves executing the scriptSig and the referenced scriptPubKey together to ensure they match.
    Verify the digital signature(s) in the scriptSig using the public key(s) provided in the referenced output's scriptPubKey.





Verify the transaction outputs:

    For each output in the vout field, verify that the value is not negative.
    Verify that the scriptPubKey in each output is valid and can be executed successfully.




Validate the locktime and sequence:

    Check the locktime field to determine if the transaction is time-locked. If it is, ensure that the current time is greater than the locktime to allow the transaction to be included in a block.
    Verify that the sequence field is valid. In most cases, the sequence is set to the maximum value (4294967295) and doesn't require additional verification.



Verify the transaction fees:

    Calculate the total input value by summing up the value of all the referenced outputs.
    Calculate the total output value by summing up the value of all the outputs.
    Ensure that the total input value is greater than or equal to the total output value. The difference between the input and output values represents the transaction fees.



## Results and Performance
    output of the result is in the output.txt or run the code to see it and the code is not really efficient due to much time it takes to produce results 

## Conclusion
    So far I may not produce the right nor the required output but I have learned a lot about blockchain and it validations 

    So I will keep learning more about it espacially converting the knowledge to code and reuseable code for much understanding 

    Faced alot of difficulty in understanding what to do and how to start but I made use of Bitcoin developers guide and other sources including youtube not forgetting AI 

    Thanks much for this I really learned alot from it 

    ##BitcoinSummerofcode  