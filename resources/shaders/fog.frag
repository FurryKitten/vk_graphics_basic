#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout(location = 0) out vec4 out_fragColor;

layout (location = 0) in VS_OUT
{
    vec3 wPos;
} surf;

layout(push_constant) uniform params_t
{
    mat4 mProjView;
    mat4 mModel;
    uint resolution;
    float minHeight;
    float maxHeight;
} params;

layout(binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout(binding = 1, set = 0) uniform NoiseData
{
    Noise noiseParams;
};

//https://www.shadertoy.com/view/4ddXW4
float hash(float h) {
    return fract(sin(h) * 43758.5453123);
}

float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 157.0 + 113.0 * p.z;
    return mix(
    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
    mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
    mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
    float f = 0.0;
    f = 0.5000 * noise(p);
    p *= 2.01;
    f += 0.2500 * noise(p);
    p *= 2.02;
    f += 0.1250 * noise(p);

    return f;
}

vec2 rmBox(vec3 pos, vec3 ro, vec3 rd)
{
    vec3 invRd = 1.0f / rd;
    vec3 t0 = (pos + noiseParams.transformScale / 2 - ro) * invRd;
    vec3 t1 = (pos - noiseParams.transformScale / 2 - ro) * invRd;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);

    float distA = max(max(tmin.x, tmin.y), tmin.z);
    float distB = min(min(tmax.x, tmax.y), tmax.z);

    float distToBox = max(0, distA);
    float distInBox = max(0, distB - distToBox);

    return vec2(distToBox, distInBox);
}

float sampleDensity(vec3 rayPos)
{
    return noise(vec3(
        noiseParams.scale.x * rayPos.x + 0.2f * Params.time,
        noiseParams.scale.y * rayPos.y + 0.4f * Params.time,
        noiseParams.scale.z * rayPos.z + 2.4f * Params.time
    ));
}

void main(void)
{
    const int NUM_STEPS = 100;

    vec3 rd = -normalize(Params.camPos - surf.wPos);
    vec3 ro = Params.camPos;

    vec2 boxInfo = rmBox(noiseParams.transformPos, ro, rd);
    float distToBox = boxInfo.x;
    float distInBox = boxInfo.y;

    float distTravelled = 0.f;
    float stepSize = distInBox / NUM_STEPS;

    float transmittance = 1.0;
    float totalDensity = 0.0f;
    while (distTravelled < distInBox)
    {
        vec3 rayPos = ro + rd * (distToBox + distTravelled);
        float density = sampleDensity(rayPos);
        if (density > 0)
        {
            transmittance *= exp(-density * stepSize * noiseParams.extinction);
            if (transmittance < 0.01f)
                break;
        }
        distTravelled += stepSize;
    }

    const vec3 col1 = vec3(0.810f,0.865f,0.848f);
    const vec3 col2 = vec3(0.770f,0.817f,0.912f);

    vec3 col = mix(col1, col2, transmittance);
    out_fragColor = vec4(col, 1 - transmittance);
}
