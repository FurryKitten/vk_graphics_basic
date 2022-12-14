#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "unpack_attributes.h"


layout(location = 0) in vec4 vPosNorm;
layout(location = 1) in vec4 vTexCoordAndTang;

layout(push_constant) uniform params_t
{
    mat4 mProjView;
    mat4 mModel;
    uint objType;
} params;

layout(binding = 2, set = 0) readonly buffer VisibleIndicesData
{
    uint visibleIndicesCount;
    uint visibleIndices[];
};

layout (location = 0 ) out VS_OUT
{
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;

} vOut;

out gl_PerVertex { vec4 gl_Position; };
void main(void)
{
    mat4 objModel = params.mModel;
    if (params.objType == 1)
    {
        uint index = visibleIndices[gl_InstanceIndex];
        objModel[3][0] += (int(index) / 100 - 50) * 2;
        objModel[3][1] += (int(index) % 100 - 50) * 2;
    }
    const vec4 wNorm = vec4(DecodeNormal(floatBitsToInt(vPosNorm.w)),         0.0f);
    const vec4 wTang = vec4(DecodeNormal(floatBitsToInt(vTexCoordAndTang.z)), 0.0f);

    vOut.wPos     = (objModel * vec4(vPosNorm.xyz, 1.0f)).xyz;
    vOut.wNorm    = normalize(mat3(transpose(inverse(objModel))) * wNorm.xyz);
    vOut.wTangent = normalize(mat3(transpose(inverse(objModel))) * wTang.xyz);
    vOut.texCoord = vTexCoordAndTang.xy;

    gl_Position   = params.mProjView * vec4(vOut.wPos, 1.0);
}
