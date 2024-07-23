import http.client
import urllib.parse
import json
import requests

API_BASE_URL = 'http://localhost:5001'

def perform_api_request(endpoint, method='GET', params=None, json_body=None):
    url = f"{API_BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}

    try:
        if method == 'GET':
            response = requests.get(url, params=params, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=json_body, headers=headers)
        else:
            print(f"Unsupported HTTP method: {method}")
            return None

        print("Status:", response.status_code)
        if response.status_code == 200:
            data = response.json() if response.text else "Success"
            print("Response:", data)
            return data
        else:
            print("Error querying API:", response.text)
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def interact_with_chat():
    print("Chat mode. Type your questions.")
    while True:
        question = input("Send: ")
        if question.lower() == "exit":
            break
        # Adjusted to perform a POST request with the question in the JSON body
        perform_api_request("/chat", method="POST", json_body={'question': question})

def check_health():
    print("Checking health...")
    perform_api_request("/healthz", "GET")

def check_ready():
    print("Checking readiness...")
    perform_api_request("/readyz", "GET")

def test_semantic_retrieval():
    print("Semantic retrieval mode.")
    while True:
        query = input("Query: ")
        if query.lower() == "e":
            break
        response = perform_api_request("/chat/test_semantic_retrieval", "POST", json_body={'question': query})
        if response and 'matches' in response:
            print_matches_neatly(response['matches'])
        else:
            print("No matches found or error in request.")

def test_hyde():
    print("Hyde test mode.")
    while True:
        question = input("Question: ")
        if question.lower() == "e":
            break
        perform_api_request("/chat/test_hyde", "POST", json_body={'question': question})
        
def reset_conversation():
    print("Resetting conversation...")
    perform_api_request("/chat/reset_session", "POST")
        
def test_feedback():
    print("Feedback test mode.")
    while True:
        feedback = input("Enter feedback. What you type maps to a json body for ID, upvote, comment (e.g. 123, true, Good answer!): ")
        feedback = feedback.split(", ")
        feedback_json = {
            "ID": feedback[0],
            "upvote": feedback[1] == "true",
            "comment": feedback[2]
        }
        if feedback[0].lower() == "e":
            break
        perform_api_request("/chat/feedback", "POST", json_body=feedback_json)

def print_matches_neatly(matches):
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    RESET = '\033[0m'

    for i, match in enumerate(matches, start=1):
        article_id = match['id']
        content = match['content']
        similarity_score = match['score']
        article_title = match.get('article_title', 'No Title')
        content_clean = content.replace('\r\n', '\n').strip()
        
        print(f"{CYAN}Match {i}:")
        print(f"Article ID: {article_id}")
        print(f"Title: {article_title}{RESET}")
        print(f"{GREEN}Similarity Score: {similarity_score:.4f}{RESET}")
        print(f"{CYAN}Content:{RESET}\n")
        print(content_clean)
        print("\n" + "-"*50 + "\n")


def main_menu():
    print("Available operations:")
    print("[1] Chat")
    print("[2] Health Check")
    print("[3] Readiness Check")
    print("[4] Test Semantic Retrieval")
    print("[5] Test Hyde")
    print("[6] Reset Conversation")
    print("[7] Test Feedback")
    print("Type 'e' to quit.")

    operations = {
        "1": interact_with_chat,
        "2": check_health,
        "3": check_ready,
        "4": test_semantic_retrieval,
        "5": test_hyde,
        "6": reset_conversation,
        "7": test_feedback
    }

    while True:
        choice = input("Select an operation: ")
        if choice.lower() == "e":
            break
        action = operations.get(choice)
        if action:
            action()
        else:
            print("Invalid choice. Please select a valid operation.")

if __name__ == "__main__":
    main_menu()
