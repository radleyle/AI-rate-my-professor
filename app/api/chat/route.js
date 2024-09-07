import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemPrompt = `
You are an advanced AI-powered assistant specializing in helping students discover the most suitable professors for their academic needs. Your primary objective is to assist students by providing the top 3 professor recommendations tailored to their specific queries, leveraging a database of professor reviews, ratings, and additional metadata.

### Your Responsibilities:

1. **Understand the Student's Query:**
   - Carefully analyze the student's input to identify key criteria, including but not limited to the subject area, desired teaching style, course level, rating preferences, and any other specific requirements mentioned.
   - If the query is broad or unclear, ask targeted questions to gain a clearer understanding of what the student is looking for.

2. **Utilize Retrieval-Augmented Generation (RAG):**
   - Employ RAG techniques to access a comprehensive database containing professor profiles, reviews, ratings, teaching styles, course information, and other relevant data.
   - Search through this database to retrieve and rank the most relevant professor profiles that match the student's criteria.

3. **Provide the Top 3 Recommendations in JSON Format:**
   - Present the student with the top 3 professors that best align with their query in the following JSON format template:
    
     {
       "professors": [
         {
           "name": "Professor Name",
           "subject": "Subject/Course",
           "rating": "Rating",
           "review_summary": "Review Summary",
           "additional_attributes": "Additional Attributes (if applicable)"
         },
        
       ]
     }

Make sure answer always in JSON format without added space
4. **Clarify and Refine Recommendations:**
   - If the student requires further refinement of the recommendations, provide additional details in JSON format.

5. **Maintain a Professional and Supportive Tone:**
   - Always respond in a polite, professional, and supportive manner.
`;

export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
    });

    try {
        const data = await req.text();

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: data },
            ],
            model: 'gpt-3.5-turbo', // Ensure this is the correct model name
        });

        // Attempt to parse the response as JSON
        try {
            const responseContent = completion.choices[0].message.content.trim();
            const professors = JSON.parse(responseContent);
            return NextResponse.json(professors);
        } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            return NextResponse.json({ error: "Invalid JSON response from API" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error during API request:", error.message);
        console.error("Stack trace:", error.stack);
        return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
    }
}
// import { NextResponse } from 'next/server';
// import { Pinecone } from '@pinecone-database/pinecone';
// import OpenAI from 'openai';

// const systemPrompt = `
// You are an advanced AI-powered assistant specializing in helping students discover the most suitable professors for their academic needs. Your primary objective is to assist students by providing the top 3 professor recommendations tailored to their specific queries, leveraging a database of professor reviews, ratings, and additional metadata.

// ### Your Responsibilities:

// 1. **Understand the Student's Query:**
//    - Carefully analyze the student's input to identify key criteria, including but not limited to the subject area, desired teaching style, course level, rating preferences, and any other specific requirements mentioned.
//    - If the query is broad or unclear, ask targeted questions to gain a clearer understanding of what the student is looking for.

// 2. **Utilize Retrieval-Augmented Generation (RAG):**
//    - Employ RAG techniques to access a comprehensive database containing professor profiles, reviews, ratings, teaching styles, course information, and other relevant data.
//    - Search through this database to retrieve and rank the most relevant professor profiles that match the student's criteria.

// 3. **Provide the Top 3 Recommendations in JSON Format:**
//    - Present the student with the top 3 professors that best align with their query in the following JSON format template:
    
//      {
//        "professors": [
//          {
//            "name": "Professor Name",
//            "subject": "Subject/Course",
//            "rating": "Rating",
//            "review_summary": "Review Summary",
//            "additional_attributes": "Additional Attributes (if applicable)"
//          },
        
//        ]
//      }

// Make sure answer always in JSON format without added space
// 4. **Clarify and Refine Recommendations:**
//    - If the student requires further refinement of the recommendations, provide additional details in JSON format.

// 5. **Maintain a Professional and Supportive Tone:**
//    - Always respond in a polite, professional, and supportive manner.
// `;

// export async function POST(req) {
//     const openai = new OpenAI({
//         apiKey: process.env.OPENROUTER_API_KEY,
//         baseURL: "https://openrouter.ai/api/v1",
//     });

//     try {
//         const data = await req.json();

//         // Initialize Pinecone
//         const pc = new Pinecone({
//             apiKey: process.env.PINECONE_API_KEY,
//         });
//         const index = pc.index('rag').namespace('ns1');

//         // Get user input from the request
//         const text = data[data.length - 1].content;

//         // Create embedding using OpenAI
//         const embedding = await openai.embeddings.create({
//             model: 'text-embedding-ada-002',
//             input: text,
//             encoding_format: 'float',
//         });

//         // Query Pinecone with the embedding
//         const results = await index.query({
//             topK: 3,
//             includeMetadata: true,
//             vector: embedding.data[0].embedding,
//         });

//         // Construct result string from Pinecone query results
//         let resultString = '\n\nReturned results from vector db (done automatically): ';
//         results.matches.forEach((match) => {
//             resultString += `\n
//                 Professor: ${match.id}
//                 Review: ${match.metadata.review}
//                 Subject: ${match.metadata.subject}
//                 Stars: ${match.metadata.stars}
//                 \n\n
//             `;
//         });

//         // Append Pinecone results to the last message
//         const lastMessage = data[data.length - 1];
//         const lastMessageContent = lastMessage.content + resultString;
//         const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

//         // Generate chat completion using OpenAI Router
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: 'system', content: systemPrompt },
//                 ...lastDataWithoutLastMessage,
//                 { role: 'user', content: lastMessageContent },
//             ],
//             model: 'gpt-3.5-turbo', // Ensure this is the correct model name
//         });

//         // Attempt to parse the response as JSON
//         try {
//             const responseContent = completion.choices[0].message.content.trim();
//             const professors = JSON.parse(responseContent);
//             return NextResponse.json(professors);
//         } catch (parseError) {
//             console.error("Failed to parse JSON:", parseError);
//             return NextResponse.json({ error: "Invalid JSON response from API" }, { status: 500 });
//         }

//     } catch (error) {
//         console.error("Error during API request:", error.message);
//         console.error("Stack trace:", error.stack);
//         // Log full details of the error for better diagnosis
//         console.error("Request details:", {
//             method: req.method,
//             url: req.url,
//             headers: req.headers,
//             body: await req.text(),
//         });
//         return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
//     }
// }


// export async function POST(req) {
//     const openai = new OpenAI({
//         apiKey: process.env.OPENROUTER_API_KEY, // Correctly set API key
//         baseURL: "https://openrouter.ai/api/v1", // Correct base URL
//     });

//     try {
//         const data = await req.json();

//         // Initialize Pinecone
//         const pc = new Pinecone({
//             apiKey: process.env.PINECONE_API_KEY,
//         });
//         const index = pc.index('rag').namespace('ns1');

//         // Get user input from the request
//         const text = data[data.length - 1].content;

//         // Create embedding using OpenAI
//         const embedding = await openai.embeddings.create({
//             model: 'text-embedding-ada-002',
//             input: text,
//             encoding_format: 'float',
//         });

//         // Query Pinecone with the embedding
//         const results = await index.query({
//             topK: 3,
//             includeMetadata: true,
//             vector: embedding.data[0].embedding,
//         });

//         // Construct result string from Pinecone query results
//         let resultString = 'Returned results from vector db (done automatically): ';
//         results.matches.forEach((match) => {
//             resultString += `\n
//                 Professor: ${match.id}
//                 Review: ${match.metadata.review}
//                 Subject: ${match.metadata.subject}
//                 Stars: ${match.metadata.stars}
//                 \n\n
//             `;
//         });

//         // Append Pinecone results to the last message
//         const lastMessage = data[data.length - 1];
//         const lastMessageContent = lastMessage.content + resultString;
//         const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

//         // Generate chat completion using OpenAI Router
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: 'system', content: systemPrompt },
//                 ...lastDataWithoutLastMessage,
//                 { role: 'user', content: lastMessageContent },
//             ],
//             model: 'openai/gpt-3.5-turbo', // Ensure this is the correct model name
//             stream: true,
//         });

//         const stream = new ReadableStream({
//             async start(controller) {
//                 const encoder = new TextEncoder();
//                 try {
//                     for await (const chunk of completion) {
//                         const content = chunk.choices[0]?.delta?.content;
//                         if (content) {
//                             const text = encoder.encode(content);
//                             controller.enqueue(text);
//                         }
//                     }
//                 } catch (err) {
//                     controller.error(err);
//                 } finally {
//                     controller.close();
//                 }
//             },
//         });

//         return new NextResponse(stream);

//     } catch (error) {
//         console.error("Error during API request:", error.message);
//         console.error("Stack trace:", error.stack);
//         return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
//     }
// }

// export async function POST(req) {
//     const openai = new OpenAI({
//         apiKey: process.env.OPENROUTER_API_KEY, // Ensure API key is correct
//         baseURL: "https://openrouter.ai/api/v1", // Ensure this is the correct URL
//     });

//     try {
//         const data = await req.text();

//         // Make sure the endpoint, headers, and body structure align with OpenRouter API requirements
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: 'system', content: systemPrompt },
//                 { role: 'user', content: data },
//             ],
//             model: 'openai/gpt-3.5-turbo', // Check if this model name is correct
//         });

//         // Parse response content correctly
//         const flashcards = JSON.parse(completion.choices[0].message.content);

//         return NextResponse.json(flashcards.flashcards);

//     } catch (error) {
//         console.error("Error during API request:", error.message);
//         console.error("Stack trace:", error.stack);
//         return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
//     }
// }