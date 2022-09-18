import { Card } from './Card'
import { FC, useEffect, useState } from 'react'
import { Movie } from '../models/Movie'
import * as Web3 from '@solana/web3.js'

const MOVIE_REVIEW_PROGRAM_ID = '7WqFjJgTYzyLkqaEk8Bst1fuhspjudPKFrmdqCKRCi6b'

export const MovieList: FC = () => {
    const [movies, setMovies] = useState<Movie[]>([])
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'))

    useEffect(() => {
        connection.getProgramAccounts(
            new Web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        ).then(async (accounts) => {
            const movies: Movie[] = accounts.reduce((accum: Movie[], { pubkey, account }) => {
                const movie = Movie.deserialize(account.data)
                if (!movie) {
                    return accum
                }

                return [...accum, movie]
            }, [])

            setMovies(movies)
        })
    }, [])
    
    return (
        <div>
            {
                movies.map((movie, i) => {
                    return (
                        <Card key={i} movie={movie} />
                    )
                })
            }
        </div>
    )
}