import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretApiKey) {
      return NextResponse.json(
        { error: "Pinata keys are not configured" },
        { status: 500 }
      );
    }

    // Prepare FormData for Pinata
    const pinataData = new FormData();
    pinataData.append("file", file);
    
    // Optional: add metadata
    const metadata = JSON.stringify({
      name: `w3Feed_${Date.now()}_${file.name}`,
    });
    pinataData.append("pinataMetadata", metadata);

    // Upload to Pinata IPFS
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
      body: pinataData as unknown as BodyInit,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Pinata Error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload to IPFS via Pinata" },
        { status: 500 }
      );
    }

    const json = await res.json();
    return NextResponse.json({ 
      success: true, 
      ipfsHash: json.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}` 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
