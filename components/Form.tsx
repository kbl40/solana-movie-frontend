import { FC } from 'react';
import { Movie } from '../models/Movie';
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Textarea } from '@chakra-ui/react';
import * as Web3 from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const MOVIE_REVIEW_PROGRAM_ID = 'Ei8Cx9wMHmzmzo1bUuh2PmoTkyhTptdsnF9tiea2QJVv'

export const Form: FC = () => {
    const [title, setTitle] = useState('')
    const [rating, setRating] = useState(0)
    const [message, setMessage] = useState('')

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()
    
    const handleSubmit = (event: any) => {
        event.preventDefault()
        const movie = new Movie(title, rating, message)
        handleTransactionSubmit(movie)
    }

    const handleTransactionSubmit = async (movie: Movie) => {
        console.log(JSON.stringify(movie))

        if (!publicKey) {
            alert('Please connect your wallet!')
            return
        }

        const buffer = movie.serialize()
        const transaction = new Web3.Transaction()

        const [pda] = await Web3.PublicKey.findProgramAddress(
            [publicKey.toBuffer(), Buffer.from(movie.title)],
            new Web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        )

        const instruction = new Web3.TransactionInstruction({
            keys: [
                //user account,
                //pda account,
                //system program id
                {
                    pubkey: publicKey,
                    isSigner: true,
                    isWritable: false
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true
                },
                {
                    pubkey: Web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false
                }
            ],
            programId: new Web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
            data: buffer
        })

        transaction.add(instruction)

        try {
            let transactionSignature = await sendTransaction(transaction, connection)
            console.log(`Transaction submitted: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`)
        } catch (error) {
            alert(JSON.stringify(error))
        }
    }

    return (
        <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            borderWidth={1}
            margin={2}
            justifyContent="center"
        >
            <form onSubmit={handleSubmit}>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Movie Title
                        </FormLabel>
                    <Input 
                    id='title' 
                    color='gray.400'
                    onChange={event => setTitle(event.currentTarget.value)}
                />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Add your review
                        </FormLabel>
                    <Textarea 
                        id='review' 
                        color='gray.400'
                        onChange={event => setMessage(event.currentTarget.value)}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Rating
                        </FormLabel>
                    <NumberInput 
                        max={5} 
                        min={1} 
                        onChange={(valueString) => setRating(parseInt(valueString))}
                    >
                        <NumberInputField id='amount' color='gray.400' />
                        <NumberInputStepper color='gray.400'>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <Button width="full" mt={4} type="submit">
                    Submit Review
                </Button>
            </form>
        </Box>
    );
}