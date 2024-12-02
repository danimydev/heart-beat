# heart-beat

API that checks services health status, it triggers a cron job every 10 minutes
that makes a request to each registered service.

### Register service

```http
POST /
Content-Type: application/json

{
  "name": "my-service",
  "healthcheckUrl": "my-service.io/healthcheck"
}

HTTP/1.1 201 OK
Content-Type: application/json

{
  "message": "service added",
  "addedService": {
    "id": "4be0643f-1d98-573b-97cd-ca98a65347dd",
    "name": "my-service",
    "healthcheckUrl": "my-service.io/healthcheck"
  }
}
```
