import tl = require("azure-pipelines-task-lib/task");
import PromoteUnlockedPackageImpl from "@dxatscale/sfpowerscripts.core/lib/sfdxwrappers/PromoteUnlockedPackageImpl";
import ArtifactFilePathFetcher from "@dxatscale/sfpowerscripts.core/lib/artifacts/ArtifactFilePathFetcher";
import PackageMetadata from "@dxatscale/sfpowerscripts.core/lib/PackageMetadata";
import ArtifactHelper from "../Common/ArtifactHelper";
import { isNullOrUndefined } from "util";
const fs = require("fs");


async function run() {
  try {
    console.log(`sfpowerscripts.. Promote Unlocked Package`);


    const sfdx_package: string = tl.getInput("package", true);
    const artifactDir = tl.getInput("aritfactDir",false);
    const devhub_alias = tl.getInput("devhub_alias", true);
    const skip_on_missing_artifact = tl.getBoolInput(
      "skip_on_missing_artifact",
      false
    );
    const projectDir=tl.getInput("projectDirectory",false);

    let package_version_id,sourceDirectory;


    if(!isNullOrUndefined(projectDir))
      {
       //Fetch Artifact
      let artifacts_filepaths = ArtifactFilePathFetcher.fetchArtifactFilePaths(
        ArtifactHelper.getArtifactDirectory(artifactDir),
        sfdx_package
      );

      ArtifactHelper.skipTaskWhenArtifactIsMissing(ArtifactFilePathFetcher.missingArtifactDecider(
        artifacts_filepaths,
        skip_on_missing_artifact
      ));


      //Read package metadata
      let packageMetadataFromArtifact: PackageMetadata = JSON.parse(fs.readFileSync(artifacts_filepaths[0].packageMetadataFilePath, "utf8"));


      console.log("##[command]Package Metadata:"+JSON.stringify(packageMetadataFromArtifact,(key:string,value:any)=>{
        if(key=="payload")
          return undefined;
        else
          return value;
     }));

      package_version_id = packageMetadataFromArtifact.package_version_id;
      console.log(`Using Package Version Id ${package_version_id}`);

     // Get Source Directory
      sourceDirectory = artifacts_filepaths[0].sourceDirectoryPath;
    }
    else
    {
      console.log("Using project directory for prmoting package")
      sourceDirectory = projectDir;
    }


    let promoteUnlockedPackageImpl: PromoteUnlockedPackageImpl = new PromoteUnlockedPackageImpl(
      sourceDirectory,
      package_version_id,
      devhub_alias
    );

    await promoteUnlockedPackageImpl.exec();
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}



run();
