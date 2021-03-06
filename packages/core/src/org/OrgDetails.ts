import child_process = require("child_process");
const retry = require("async-retry");

export default class OrgDetails {

  public static async getOrgDetails(username: string): Promise<string> {

      return await retry(
        async bail => {
           console.log("Querying Org Details");
            let cmdOutput = child_process.execSync(
              `sfdx force:data:soql:query -q "SELECT Id, InstanceName, IsSandbox, Name, OrganizationType FROM Organization" -u ${username} --json`,
              { encoding: "utf8" }
            );
            let result = JSON.parse(cmdOutput);
            if (result["status"] == 0) {
              console.log(result["result"]["records"][0]);
              return result["result"]["records"][0];
            }
            else
            {
              bail(new Error("Unable to fetch Org details"));
            }
        },
        { retries: 3, minTimeout: 2000 }
      );
  }

}
