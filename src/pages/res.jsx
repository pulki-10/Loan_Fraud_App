{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"riskStatus\": \"Rejected\", \"reason\": \"Agent analysis: Credit score (512) is significantly below minimum requirement of 600 and DTI ratio (42%) exceeds acceptable threshold of 35%.\", \"structuredLogs\": {\"SessionInfo\": [\
  "Agent: Initializing ephemeral underwriting session...\", \"
  Agent: Extracted Applicant ID from Request Payload: LN-APP-161\", \
  "Agent: Internal state synchronized. Flushing ephemeral data.\"], \
  "IdentityChecks\": 
  [\"Agent:
     Analyzing primary identity folder: uploads/LN-APP-161/poc_upload/\"], \"FinancialAudit\": [\"Agent: Internal credit marker retrieved. Score: 512\", \"Agent: Scanning financial sub-directory: uploads/LN-APP-161/bank_statements_upload/\", \"Agent: Located 1 bank statement(s) for Agent review.\"], \"AgentFinalDecision\": [\"Agent: Commencing automated risk assessment...\", \"Agent: Final assessment concluded. Decision: Rejected\"]}}"
}