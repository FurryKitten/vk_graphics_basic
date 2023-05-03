#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout(location = 0) out vec4 out_fragColor;

layout (location = 0 ) in VS_OUT
{
    vec2 texCoord;
} surf;

layout(binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout (binding = 1) uniform sampler2D hdr;

vec4 tonemapReinhard(vec4 col)
{
    float luminance = dot(vec3(0.3, 0.59, 0.11), col.rgb);
    float scale =  luminance / (luminance + 1.0f);
    return col * scale / luminance;
}

vec4 tonemapFilmic(vec4 col)
{
    col *= 0.2;
    col = max(vec4(0.0f), col - vec4(0.004f));
    col = (col * (6.2f * col + 0.5f)) / (col * (6.2f * col + 1.7f) + 0.06f);
    return col;
}

void main()
{
    vec4 color = texture(hdr, surf.texCoord);
    if (Params.hdrMode == 0)
    {
        out_fragColor = clamp(color, 0, 1);
    }
    else if (Params.hdrMode == 1)
    {
        out_fragColor = tonemapReinhard(color);
    }
    else
    {
        out_fragColor = tonemapFilmic(color);
    }
}