#include "shadowmap_render.h"

#include "../../render/render_gui.h"

void SimpleShadowmapRender::SetupGUIElements()
{
  ImGui_ImplVulkan_NewFrame();
  ImGui_ImplGlfw_NewFrame();
  ImGui::NewFrame();
  {
//    ImGui::ShowDemoWindow();
    ImGui::Begin("Simple render settings");

    ImGui::ColorEdit3("Meshes base color", m_uniforms.baseColor.M, ImGuiColorEditFlags_PickerHueWheel | ImGuiColorEditFlags_NoInputs);
    ImGui::SliderFloat3("Light source position", m_uniforms.lightPos.M, -10.f, 10.f);

    ImGui::Text("Application average %.3f ms/frame (%.1f FPS)", 1000.0f / ImGui::GetIO().Framerate, ImGui::GetIO().Framerate);

    ImGui::NewLine();

    ImGui::SliderFloat("Min height", &pushConst2M.minHeight, 0.f, 10.f);
    ImGui::SliderFloat("Max height", &pushConst2M.maxHeight, 0.f, 10.f);

    ImGui::NewLine();

    ImGui::SliderFloat("Extinction", &m_noiseInfo.extinction, 0.f, 5.f);
    ImGui::SliderFloat3("Noise scale", m_noiseInfo.scale.M, 0.f, 10.f);
    ImGui::SliderFloat3("Fog position", m_noiseInfo.transformPos.M, -30.f, 30.f);
    ImGui::SliderFloat3("Fog scale", m_noiseInfo.transformScale.M, -10.f, 10.f);

    ImGui::NewLine();

    ImGui::TextColored(ImVec4(1.0f, 1.0f, 0.0f, 1.0f),"Press 'B' to recompile and reload shaders");
    ImGui::End();
  }

  // Rendering
  ImGui::Render();
}
