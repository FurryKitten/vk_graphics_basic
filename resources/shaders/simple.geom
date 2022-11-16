#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout (triangles) in;
layout (triangle_strip, max_vertices = 10) out;

layout (push_constant) uniform params_t {
    mat4 mProjView;
    mat4 mModel;
} params;

layout (binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout (location = 0) in VS_IN {
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;
} vIn[];

layout (location = 0) out VS_OUT {
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;
} vOut;

void main(void)
{
    vec3 normal = normalize(vIn[0].wNorm + vIn[1].wNorm + vIn[2].wNorm);
    vec3 tangent = normalize(vIn[0].wTangent + vIn[1].wTangent + vIn[2].wTangent);
    vec3 middlePoint = (vIn[0].wPos + vIn[1].wPos + vIn[2].wPos) / 3.0f;

    for (int i = 0; i < 3; i++)
    {
        // vec3 offset = normal * clamp(sin(5.f * (Params.time + vIn[i].wPos.x)), 0.f, 0.1f);
        vec3 offset = normal * (clamp(sin(4.6f * (Params.time + vIn[i].wPos.x)), 0.6f, 0.8f) - 0.6f) * 0.5f;
        vOut.wPos = vIn[i].wPos + offset;
        vOut.wNorm = vIn[i].wNorm;
        vOut.wTangent = vIn[i].wTangent;
        vOut.texCoord = vIn[i].texCoord;
        gl_Position = params.mProjView * vec4(vOut.wPos, 1.0);
        EmitVertex();
    }
    EndPrimitive();
}
