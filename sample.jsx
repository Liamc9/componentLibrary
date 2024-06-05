// IMPORTS
import { useState, useEffect } from 'react'

// CREATE FUNCTION
export default function ExampleComponent() {
    // STATE VARIABLES
    const [state, setState] = useState(0)

    // JAVASCRIPT LOGIC
    useEffect(() => {
        setState(state + 1)
    }, [])

    // HTML
    return (
        <>
            <head></head>
            <body></body>
        </>
    )
}
