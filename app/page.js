"use client"

import { useState } from "react"

export default function Home(){

const [location,setLocation]=useState("")
const [activity,setActivity]=useState("")
const [result,setResult]=useState(null)

async function predict(){

 const response = await fetch("https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict",{
  method:"POST",
  headers:{ "Content-Type":"application/json"},
  body:JSON.stringify({
   location:location,
   activity:activity
  })
 })

 const data = await response.json()
 setResult(data)

}

return(

<div style={{padding:40}}>

<h1>RogVaani Health Risk Predictor</h1>

<br/>

<input
placeholder="Enter your city"
onChange={(e)=>setLocation(e.target.value)}
/>

<br/><br/>

<select onChange={(e)=>setActivity(e.target.value)}>

<option>Outdoor Exercise</option>
<option>Cycling</option>
<option>Walking</option>
<option>Indoor</option>

</select>

<br/><br/>

<button onClick={predict}>Check Health Risk</button>

<br/><br/>

{result && (

<div>

<h2>Risk Score: {result.score}</h2>

<p>{result.advice}</p>

</div>

)}

</div>

)

}