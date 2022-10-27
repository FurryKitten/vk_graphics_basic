#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "unpack_attributes.h"
#include "common.h"


layout(location = 0) in vec4 vPosNorm;
layout(location = 1) in vec4 vTexCoordAndTang;

layout(push_constant) uniform params_t
{
    mat4 mProjView;
    mat4 mModel;
    uint type;
} params;


layout(binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout (location = 0 ) out VS_OUT
{
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;

} vOut;

mat3 rotY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c,   0.0, -s,
    0.0, 1.0, 0.0,
    s,   0.0, c
  );
}

out gl_PerVertex { vec4 gl_Position; };
void main(void)
{
    const vec4 wNorm = vec4(DecodeNormal(floatBitsToInt(vPosNorm.w)),         0.0f);
    const vec4 wTang = vec4(DecodeNormal(floatBitsToInt(vTexCoordAndTang.z)), 0.0f);

    switch (params.type)
    {
    case 1:
    {
        vec3 newPos = vec3(
            vPosNorm.x + sin(vPosNorm.y * 10 + Params.time * 4) * 0.01, 
            vPosNorm.y + sin(vPosNorm.z * 10 + Params.time * 4) * 0.03 + 0.2, 
            vPosNorm.z
        ) * rotY(Params.time);
        vOut.wPos = (params.mModel * vec4(newPos, 1.0f)).xyz;
        break;
    }
    case 3:
    {
        vec3 newPos = vec3(vPosNorm.x + 0.9 + sin(Params.time) * 1.0, vPosNorm.y, vPosNorm.z - 0.8 + cos(Params.time) * 1.0) ;
        vOut.wPos = (params.mModel * vec4(newPos, 1.0f)).xyz;
        break;
    }
    default:
        vOut.wPos = (params.mModel * vec4(vPosNorm.xyz, 1.0f)).xyz;
        break;
    }

    vOut.wNorm    = normalize(mat3(transpose(inverse(params.mModel))) * wNorm.xyz);
    vOut.wTangent = normalize(mat3(transpose(inverse(params.mModel))) * wTang.xyz);
    vOut.texCoord = vTexCoordAndTang.xy;

    gl_Position   = params.mProjView * vec4(vOut.wPos, 1.0);
}
