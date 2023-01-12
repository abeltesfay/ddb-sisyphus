const TEMP_IMPORTABLE_JSON = String.raw`{
  "ModelName": "BasicTemplate",
  "ModelMetadata": {
    "Author": "",
    "DateCreated": "Jan 12, 2023, 10:14 AM",
    "DateLastModified": "Jan 12, 2023, 10:17 AM",
    "Description": "",
    "AWSService": "Amazon DynamoDB",
    "Version": "3.0"
  },
  "DataModel": [
    {
      "TableName": "BasicTable",
      "KeyAttributes": {
        "PartitionKey": {
          "AttributeName": "pk",
          "AttributeType": "S"
        },
        "SortKey": {
          "AttributeName": "sk",
          "AttributeType": "S"
        }
      },
      "NonKeyAttributes": [
        {
          "AttributeName": "field1",
          "AttributeType": "S"
        },
        {
          "AttributeName": "field2",
          "AttributeType": "BOOL"
        },
        {
          "AttributeName": "field3",
          "AttributeType": "N"
        }
      ],
      "TableFacets": [
        {
          "FacetName": "Facet1",
          "KeyAttributeAlias": {
            "PartitionKeyAlias": "pk",
            "SortKeyAlias": "sk"
          },
          "TableData": [],
          "NonKeyAttributes": [
            "field1",
            "field2",
            "field3"
          ]
        },
        {
          "FacetName": "Facet2",
          "KeyAttributeAlias": {
            "PartitionKeyAlias": "sk",
            "SortKeyAlias": "field2"
          },
          "TableData": [],
          "NonKeyAttributes": [
            "field1",
            "field2"
          ]
        },
        {
          "FacetName": "Facet3",
          "KeyAttributeAlias": {
            "PartitionKeyAlias": "field2",
            "SortKeyAlias": "field3"
          },
          "TableData": [],
          "NonKeyAttributes": [
            "field2",
            "field3"
          ]
        }
      ],
      "GlobalSecondaryIndexes": [
        {
          "IndexName": "sk-field1-index",
          "KeyAttributes": {
            "PartitionKey": {
              "AttributeName": "sk",
              "AttributeType": "S"
            },
            "SortKey": {
              "AttributeName": "field1",
              "AttributeType": "S"
            }
          },
          "Projection": {
            "ProjectionType": "ALL"
          }
        },
        {
          "IndexName": "sk-index",
          "KeyAttributes": {
            "PartitionKey": {
              "AttributeName": "sk",
              "AttributeType": "S"
            }
          },
          "Projection": {
            "ProjectionType": "ALL"
          }
        },
        {
          "IndexName": "field2-field3-index",
          "KeyAttributes": {
            "PartitionKey": {
              "AttributeName": "field3",
              "AttributeType": "N"
            },
            "SortKey": {
              "AttributeName": "field1",
              "AttributeType": "S"
            }
          },
          "Projection": {
            "ProjectionType": "ALL"
          }
        }
      ],
      "DataAccess": {
        "MySql": {}
      },
      "BillingMode": "PROVISIONED",
      "ProvisionedCapacitySettings": {
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        },
        "AutoScalingRead": {
          "ScalableTargetRequest": {
            "MinCapacity": 1,
            "MaxCapacity": 10,
            "ServiceRole": "AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
          },
          "ScalingPolicyConfiguration": {
            "TargetValue": 70
          }
        },
        "AutoScalingWrite": {
          "ScalableTargetRequest": {
            "MinCapacity": 1,
            "MaxCapacity": 10,
            "ServiceRole": "AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
          },
          "ScalingPolicyConfiguration": {
            "TargetValue": 70
          }
        }
      }
    }
  ]
}`;