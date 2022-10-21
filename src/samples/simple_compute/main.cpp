#include "simple_compute.h"
#include <random>


constexpr int LENGTH           = 100000000;
constexpr int VULKAN_DEVICE_ID = 0;
constexpr int INTERVAL         = 7;
std::vector<float> numbers;

std::vector<float> initNumbers()
{
  std::random_device rd;
  std::mt19937 rng(rd());
  std::uniform_real_distribution<float> uni(-1000, 1000);

  std::vector<float> generated(LENGTH);
  for (int i = 0; i < LENGTH; ++i)
  {
    generated[i] = uni(rng);
  }

  return generated;
}

void testCPU()
{
  auto t1 = high_resolution_clock::now();

  int offset = INTERVAL / 2;
  std::vector<float> newNumbers(numbers);

  for (int i = 0; i < LENGTH; ++i)
  {
    float value = 0.0;
    for (int j = -offset; j <= offset; ++j)
    {
      if (i - offset >= 0 && i + offset < LENGTH)
      {
        value += numbers[i + j];
      }
    }
    newNumbers[i] = numbers[i] - value / 7.f;
  }
  float mean = std::reduce(newNumbers.begin(), newNumbers.end()) / newNumbers.size();

  auto t2 = high_resolution_clock::now();
  duration<double, std::milli> ms_time = t2 - t1;

  std::cout << "\n\nCPU TEST:\n";
  std::cout << "Mean: " << std::setprecision(8) << mean << std::endl;
  std::cout << "Time: " << std::setprecision(2) << ms_time.count() << "ms\n";
}

int main()
{
  numbers = initNumbers();

  std::shared_ptr<ICompute> app = std::make_unique<SimpleCompute>(LENGTH, numbers);
  if (app == nullptr)
  {
    std::cout << "Can't create render of specified type" << std::endl;
    return 1;
  }

  app->InitVulkan(nullptr, 0, VULKAN_DEVICE_ID);

  app->Execute();
  
  testCPU();

  return 0;
}
