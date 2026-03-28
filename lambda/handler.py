import json
import os
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import HTTPError

FRED_API_KEY = os.environ["FRED_API_KEY"]
FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def lambda_handler(event, context):
    # Handle CORS preflight
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    # Parse query parameters
    params = event.get("queryStringParameters") or {}
    series_id = params.get("series_id")

    if not series_id:
        return {
            "statusCode": 400,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"error": "series_id is required"}),
        }

    # Build FRED API request
    fred_params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "sort_order": "asc",
    }

    observation_start = params.get("observation_start")
    if observation_start:
        fred_params["observation_start"] = observation_start

    url = f"{FRED_BASE_URL}?{urlencode(fred_params)}"

    try:
        req = Request(url)
        with urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8")

        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": body,
        }
    except HTTPError as e:
        return {
            "statusCode": e.code,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"error": f"FRED API returned {e.code}"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
