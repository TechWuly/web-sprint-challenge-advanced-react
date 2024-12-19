import React, { useState } from 'react';
import axios from 'axios';

    // Utility function: Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Suggested initial states
  const initialMessage = ''
  const initialEmail = ''
  const initialSteps = 0
  const initialIndex = 4 // the index the "B" is at


export default function AppFunctional(props) {
  // THE FOLLOWING HELPERS ARE JUST RECOMMENDATIONS.
  // You can delete them and build your own logic from scratch.

  const [message, setMessage] = useState(initialMessage);
  const [email, setEmail] = useState(initialEmail);
  const [steps, setSteps] = useState(initialSteps);
  const [index, setIndex] = useState(initialIndex);

  const gridSize = 3; //3*3 gid.

       //helper: gets cordinate based on index.
function getXY() { 
    // It it not necessary to have a state to track the coordinates.
    // It's enough to know what index the "B" is at, to be able to calculate them.
    const x = (index % gridSize) + 1;
    const y = Math.floor(index / gridSize) + 1;
    return [x, y];
  }

      // Helper: Generate coordinates message 
function getXYMessage()  {
    // It it not necessary to have a state to track the "Coordinates (2, 2)" message for the user.
    // You can use the `getXY` helper above to obtain the coordinates, and then `getXYMessage`
    // returns the fully constructed string.
    const [x, y] = getXY();
    return `Coordinates (${x}, ${y})`;
  }

     // Helper: Reset all states to initial values
function reset() {
    // Use this helper to reset all states to their initial values.
    setMessage(initialMessage);
    setEmail(initialEmail);
    setSteps(initialSteps);
    setIndex(initialIndex);
  }
      // Helper: Calculate the next index based on direction
function getNextIndex(direction) {
    // This helper takes a direction ("left", "up", etc) and calculates what the next index
    // of the "B" would be. If the move is impossible because we are at the edge of the grid,
    // this helper should return the current index unchanged.
    const x = index % gridSize;
    const y = Math.floor(index / gridSize);

    switch (direction) {
      case 'left':
        return x > 0 ? index - 1 : index; // Move left unless at the left edge
      case 'right':
        return x < gridSize - 1 ? index + 1 : index; // Move right unless at the right edge
      case 'up':
        return y > 0 ? index - gridSize : index; // Move up unless at the top edge
      case 'down':
        return y < gridSize - 1 ? index + gridSize : index; // Move down unless at the bottom edge
      default:
        return index; // No change for invalid directions
    }
  }

    // Event handler: Move the "B"
function move(evt) {
    // This event handler can use the helper above to obtain a new index for the "B",
    // and change any states accordingly.
    const direction = evt.target.id;
    const nextIndex = getNextIndex(direction);

    if (nextIndex === index) {
      setMessage(`You can't go ${direction}`);
    } else {
      setIndex(nextIndex);
      setSteps(steps + 1);
      setMessage(''); // Clear any previous error message
    }
  }

     // Event handler: Update the email value
function onChange(evt) {
    // You will need this to update the value of the input.
    setEmail(evt.target.value);
    console.log("Email reset to:", email); // This will log the current email state
  }

    // Event handler: Handle form submission
async function onSubmit(evt) {
    // Use a POST request to send a payload to the server.
    evt.preventDefault();
    

    // Validate email
  if (!email.trim()) {
    setMessage("Ouch: email is required");
    return;
  }
    // Validate email format or validate email is provided
  if (!isValidEmail(email)) {
    setMessage("Ouch: email must be a valid email");
    return;
  }
       // Check banned email
  const bannedEmails = ["foo@bar.baz"];
    if (bannedEmails.includes(email)) {
     setMessage(`${email} failure #${index}`);
    return;
}
      // Extract coordinates or send payload
    const [x, y] = getXY();
    const payload = { x, y, steps, email };

    try {
      const res = await axios.post('http://localhost:9000/api/result', payload);
      setMessage(res.data.message); // Assuming the server response includes a success message
      console.log(res.data.message);
      setEmail(''); // Reset email
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred'); // Display server error or generic error
      
    }
}

  return (
    <div id="wrapper" className={props.className}>
      <div className="info">
        <h3 id="coordinates">{getXYMessage()}</h3>
        <h3 id="steps">You moved {steps} {steps === 1 ? 'time' : 'times'}</h3>
      </div>
      <div id="grid">
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
            <div key={idx} className={`square${idx === index ? ' active' : ''}`}>
              {idx === index ? 'B' : null}
            </div>
          ))
        }
      </div>
      <div className="info">
        <h3 id="message" className={message.includes("failure") ? "error" : "success"}>{message}</h3> {/* Render the message here */}
      </div>
      <div id="keypad">
        <button id="left" onClick={move}>LEFT</button>
        <button id="up" onClick={move}>UP</button>
        <button id="right" onClick={move}>RIGHT</button>
        <button id="down" onClick ={move}>DOWN</button>
        <button id="reset" onClick={reset}>reset</button>
      </div>
      <form onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
        <input 
         id="email"
         type="email"
         placeholder="type email"
         value={email} 
         onChange={onChange}
         />
        <input id="submit" type="submit" value="submit"/>
      </form>
    </div>
  )
}
