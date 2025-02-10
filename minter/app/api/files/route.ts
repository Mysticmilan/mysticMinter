import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const name = data.get("name") as string || "Mystic NFT";
    const description = data.get("description") as string || "This NFT is created by Mystic";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // **Step 1: Upload Image First**
    const imageUpload = await pinata.upload.file(file);
    if (!imageUpload || !imageUpload.IpfsHash) {
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    const imageCID = imageUpload.IpfsHash; // Store CID for deletion if needed
    const imageUrl = await pinata.gateways.convert(imageCID);

    // **Step 2: Upload Metadata JSON with Image URL**
    const metadata = {
      name,
      description,
      image: imageUrl
    };

    const jsonUpload = await pinata.upload.json(metadata);
    if (!jsonUpload || !jsonUpload.IpfsHash) {
      // **If metadata upload fails, delete the uploaded image**
      await pinata.unpin([imageCID]).catch(() => {
        console.log("Failed to remove image from IPFS");
      });

      return NextResponse.json({ error: "Metadata upload failed, image deleted" }, { status: 500 });
    }

    const metadataUrl = await pinata.gateways.convert(jsonUpload.IpfsHash);

    return NextResponse.json({ imageUrl, metadataUrl }, { status: 200 });

  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
