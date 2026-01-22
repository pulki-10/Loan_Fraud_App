// // /src/api/loanService.js (Suggested new file)

// // The API endpoint
// const API_URL = "https://9psgf1hmt5.execute-api.us-west-2.amazonaws.com/v1/address-verify";

// // The full loan application data payload
// const LOAN_APPLICATION_PAYLOAD = {
//     "applicationDetails": {
//         "applicationId": "LN-APP-857502", // NOTE: This is currently hardcoded, you might update this later
//         "loanType": "Personal",
//         "loanAmount": 25000.00,
//         "loanPurpose": "Home renovation",
//         "termInMonths": 60,
//         "submissionDate": "2025-10-16"
//     },
//     "applicant": {
//         "personalInfo": {
//             "firstName": "Jane",
//             "lastName": "E Doe",
//             "dateOfBirth": "1988-05-21",
//             "socialSecurityNumber": "XXX-XX-1234",
//             "email": "jane.doe@example.com",
//             "phoneNumber": "+1 (555) 123-4567"
//         },
//         "contactInfo": {
//             "address": {
//                 "street": "456 OAK AVE",
//                 "city": "CITYVILLE",
//                 "state": "CA",
//                 "zipCode": "90210"
//             },
//             "residencyStatus": "Own",
//             "timeAtAddressInYears": 5
//         },
//         "employment": {
//             "employerName": "Example Corporation",
//             "jobTitle": "Senior Software Engineer",
//             "timeAtJobInYears": 8,
//             "annualIncome": 120000.00
//         },
//         "financials": {
//             "monthlyDebtObligations": 1500.00,
//             "checkingAccountBalance": 7500.00,
//             "savingsAccountBalance": 15000.00,
//             "creditScore": 760
//         }
//     },
//     "documents": [
//         {
//             "documentType": "Proof of Identity",
//             "fileName": "janedoe_drivers_license.pdf",
//             "fileUrl": "https://storage.example.com/docs/janedoe_drivers_license.pdf"
//         },
//         {
//             "documentType": "Proof of Income",
//             "fileName": "janedoe_payslip.pdf",
//             "fileUrl": "https://storage.example.com/docs/janedoe_payslip.pdf"
//         }
//     ],
//     "coApplicant": null
// };


// export const startLoanValidation = async (applicantId) => {
//     // Optionally update the payload with the dynamic applicantId here:
//     // const payload = { ...LOAN_APPLICATION_PAYLOAD };
//     // payload.applicationDetails.applicationId = applicantId; 

//     try {
//         const response = await fetch(API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(LOAN_APPLICATION_PAYLOAD), // Use the hardcoded payload for now
//         });
        
//         const data = await response.json();
//         dispatch({ type: "SET_ADDRESS_VERIFICATION_DATA", payload: data });
//         console.log("data", data)

//         if (!response.ok) {
//             // Throw an error with the message to be caught by the component
//             throw new Error(data.message || `API request failed with status: ${response.status}`);
//         }

//         return data; // Return the successful data
        
//     } catch (err) {
//         // Re-throw the error so the component's catch block can handle it
//         console.error('API Service Error:', err);
//         throw err;
//     }
// };

// // You can export other API functions from here as well.