#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) out vec4 color;

layout (binding = 0) uniform sampler2D colorTex;

layout (location = 0 ) in VS_OUT
{
  vec2 texCoord;
} surf;

#define RADIUS 2
#define SIG_D 2.0
#define SIG_R 0.1

void main()
{
  ivec2 texSize = textureSize(colorTex, 0);

  vec3 sumWeights = vec3(0.0);
  vec3 resColor = vec3(0.0);
  vec3 currentColor = textureLod(colorTex, surf.texCoord, 0).rgb;

  for (int x = -RADIUS; x <= RADIUS; x++)
  {
    for (int y = -RADIUS; y <= RADIUS; y++)
    {
      vec3 pixelColor = textureLod(colorTex, surf.texCoord + vec2(x, y) / texSize, 0).rgb;
      vec3 colDif = (pixelColor - currentColor) * (pixelColor - currentColor);
      vec3 weight = exp(-(x*x + y*y) / (2*SIG_D*SIG_D) - colDif / (2*SIG_R*SIG_R));
      resColor += weight * pixelColor;
      sumWeights += weight;
    }
  }

  resColor /= sumWeights;
  color = vec4(resColor, 1.0);

  //color = textureLod(colorTex, surf.texCoord, 0);
}