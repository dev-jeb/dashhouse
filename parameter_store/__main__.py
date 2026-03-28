import json
from pathlib import Path

import pulumi
from pulumi_aws import ssm

credentials_files = Path(__file__).parent.glob("params/**/*.json")

for credentials_file in credentials_files:
    with credentials_file.open() as f:
        directory = credentials_file.parent
        environment = credentials_file.stem
        credentials = json.load(f)

        for key in credentials:
            value = credentials[key]
            credential_str = value if isinstance(value, str) else json.dumps(value)

            parameter = ssm.Parameter(
                key,
                type="SecureString",
                name=f"/{directory.name}/{environment}/{key}",
                value=credential_str,
                overwrite=True,
            )

            pulumi.export(f"{key}_parameter_arn", parameter.arn)
