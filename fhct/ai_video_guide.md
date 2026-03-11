# ComplianceIQ Florida: AI Video Production Guide

This guide outlines the workflow for generating high-fidelity video assets for the training modules. To maintain the "Neural" and "Cinematic" aesthetic, follow these specifications.

## 🛠 Recommended Production Strategies (Cost-Tiered)

To maximize your budget, we recommend a **Hybrid Approach**.

| Tier | Strategy | Est. Cost / Slide | Recommendation |
| :--- | :--- | :--- | :--- |
| **🆓 Open Source** | **Self-Hosted Neural Shift** | **$0.00 (+ Compute)** | Use **CogVideoX-5B** or **Mochi 1**. Best for privacy and $0 licensing. |
| **🥇 Essential** | **Neural Still Engine** | **$0.02 - $0.10** | Use DALL-E 3 for high-res healthcare stills. |
| **🥈 Optimized** | **Motion-Enhanced Pipeline** | **$0.40 - $1.80** | **DALL-E 3 → Luma/Runway.** Best ROI for speed. |
| **🥉 Balanced** | **Hybrid Intro/Outro** | **$1.80 - $4.00** | Use HeyGen for Intro/Outro; Stills for content. |
| **🏆 Premium** | **Full Cinematic Pipeline** | **$15.00 - $35.00** | Full HeyGen lip-sync. Highest engagement. |

## 📐 Technical Specifications (Neural Stills)

*   **Aspect Ratio**: 16:9
*   **Source**: High-Quality AI Generated Imagery (e.g., "Modern hospital ICU with blue atmospheric lighting").
*   **Motion**: Handled by our internal CSS engine (Ken Burns + Lidar Overlay).

## 🚀 Implementation Workflow

### 1. Generating Scenario Videos
When a slide requires a "Video" type (e.g., HIPAA Room Security or Fire Erasure), use a prompt like:
> *"Cinematic 4k shot of a modern healthcare facility hallway, technical overlay, soft teal lighting, high-end medical equipment, depth of field, corporate training style."*

### ⚡ High-Efficiency Motion Strategy (< $2.00)
To achieve cinematic movement without the high cost of full-length AI video credits, follow this **Image-to-Motion (I2M)** workflow:

1.  **Generate a Base Still ($0.10):** Use DALL-E 3 to create a high-fidelity scene (e.g., *"Modern hospital hallway, volumetric lighting, 8k"*).
2.  **Animate the Depth ($0.40 - $1.20):** Upload the image to **Luma Dream Machine** or **Runway Gen-3 Alpha (Turbo Mode)**. 
    *   *Pro-Tip:* Use a prompt like *"Subtle camera push-in, medical equipment lights blinking, depth of field shift"* to keep the motion realistic and artifact-free.
3.  **Total Cost:** Approximately **$0.50 - $1.30** per 5-second cinematic loop.

### 🏠 Self-Hosted Open Source Strategy ($0.00)
For maximum data privacy and zero marginal cost, you can run high-end video models locally using **ComfyUI**:

1.  **Model Selection:** 
    *   **CogVideoX-5B:** Excellent for realistic healthcare motions (runs on 16GB+ VRAM).
    *   **Mochi 1:** Ultra-high fidelity (requires 24GB+ VRAM/A100).
    *   **AnimateDiff:** Best for "stylized" medical diagrams or technical overlays.
2.  **Workflow:** Generate images via Stable Diffusion (SDXL) and use the `Image-to-Video` nodes to animate.
3.  **Pros:** No subscription fees, unlimited generations, 100% private.
4.  **Cons:** Requires powerful local GPU (RTX 3090/4090) or rented cloud compute (RunPod/Lambda).

### 2. Organizing Assets
Place all generated video files in the `/public/assets/videos/` directory.

### 3. Updating the Codebase
To link a video to a specific course/scene, update the `SCENES` object in `complianceiq.jsx`:

```javascript
// Example: Adding a real video file
1: [
  { 
    label: "Scene 1: Data Integrity", 
    videoUrl: "/assets/videos/hipaa_integrity.mp4", // Path to your generated video
    img: "/fallback_image.png" // Required for low-bandwidth fallback
  }
]
```

## 🎭 Simulation Mode (Fallback)
If a real video file (`videoUrl`) is not provided, the platform automatically engages **"Cinematic Ken Burns"** mode:
*   It takes the provided `img` and applies a CSS-driven scale/pan animation.
*   It cycles through multiple scenes every 5 seconds to simulate a varied broadcast.
*   It overlays dynamic "Live" signals and technical readouts to maintain the AI aesthetic.
