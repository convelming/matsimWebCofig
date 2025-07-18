# 版权声明：本文为CSDN博主「#苦行僧」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
# 原文链接：https://blog.csdn.net/weixin_43646592/article/details/113427937
import netCDF4 as nc
import json
import math
# from pyproj import Proj, transform

# proj_wgs84 = Proj(init='epsg:4326')  # WGS84坐标系
# proj_mercator = Proj(init='epsg:3857')  # 墨卡托投影坐标系

from pyproj import Transformer
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857")

filePath = "c35aad5d981e7061083bef8febe3af8a"

# # 打开NC文件
nf1 = nc.Dataset(filePath + "/10m_u_component_of_wind_stream-oper_daily-mean.nc")
nf2 = nc.Dataset(filePath + "/10m_v_component_of_wind_0_daily-mean.nc")

# # 获取所有变量的字典
# variables = nf.variables

#  打印所有变量的名称
# print(nf.variables.keys()) # dict_keys(['u10', 'number', 'latitude', 'longitude', 'valid_time'])


# print(nf.variables['number']) # float32 u10(valid_time, latitude, longitude)

# 插值数
segments = 4

all_u10 = nf1.variables['u10'] # 东西分项 对应经度 latitude
all_v10 = nf2.variables['v10'] # 南北分项 对应纬度 longitude

all_times = nf1.variables['valid_time']
all_latitude = nf1.variables['latitude']
all_longitude = nf1.variables['longitude']

file = open('wind.json', 'w+')
arry = []

center = None
maxValue = 0
for time_idx in range(len(all_times)):
  for lat_idx in range(len(all_latitude)):
    for lon_idx in range(len(all_longitude)):
      

      time = float(all_times[time_idx].data)
      # 左上      
      lon_1 = float(all_longitude[lon_idx].data)
      v10_1 = float(all_v10[time_idx,lat_idx,lon_idx].data)
      lat_1 = float(all_latitude[lat_idx].data)
      u10_1 = float(all_u10[time_idx,lat_idx,lon_idx].data)
      
      sx_1, sy_1 = transformer.transform(lat_1, lon_1)
      if(center == None): center = [sx_1,sy_1]

      if(lat_idx == len(all_latitude) - 1 and lon_idx == len(all_longitude) - 1):
        value = math.sqrt(v10_1 * v10_1 + u10_1 * u10_1)
        maxValue = max( maxValue, value)
        items = [sx_1 - center[0],sy_1 - center[1], v10_1, u10_1, value]
        arry.append(items)
      elif(lat_idx == len(all_latitude)-1 ):
        # 左下
        lon_2 = float(all_longitude[lon_idx+1].data)
        v10_2 = float(all_v10[time_idx,lat_idx,lon_idx+1].data)
        lat_2 = float(all_latitude[lat_idx].data)
        u10_2 = float(all_u10[time_idx,lat_idx,lon_idx+1].data)
        for index in range(segments):
          lon = lon_1 * (segments - index) / segments + lon_2 * index / segments
          v10 = v10_1 * (segments - index) / segments + v10_2 * index / segments
          lat = lat_1 * (segments - index) / segments + lat_2 * index / segments
          u10 = u10_1 * (segments - index) / segments + u10_2 * index / segments
          sx, sy = transformer.transform(lat, lon)
          value = math.sqrt(v10 * v10 + u10 * u10)
          maxValue = max(maxValue, value)
          items = [sx - center[0],sy - center[1], v10, u10, value]
          arry.append(items)
      elif(lon_idx == len(all_longitude)-1):
        # 右上
        lon_2 = float(all_longitude[lon_idx].data)
        v10_2 = float(all_v10[time_idx,lat_idx+1,lon_idx].data)
        lat_2 = float(all_latitude[lat_idx+1].data)
        u10_2 = float(all_u10[time_idx,lat_idx+1,lon_idx].data)
        for index in range(segments):
          lon = lon_1 * (segments - index) / segments + lon_2 * index / segments
          v10 = v10_1 * (segments - index) / segments + v10_2 * index / segments
          lat = lat_1 * (segments - index) / segments + lat_2 * index / segments
          u10 = u10_1 * (segments - index) / segments + u10_2 * index / segments
          sx, sy = transformer.transform(lat, lon)
          value = math.sqrt(v10 * v10 + u10 * u10)
          maxValue = max(maxValue, value)
          items = [sx - center[0],sy - center[1], v10, u10, value]
          arry.append(items)
      else:
        # 右上
        lon_2 = float(all_longitude[lon_idx].data)
        v10_2 = float(all_v10[time_idx,lat_idx+1,lon_idx].data)
        lat_2 = float(all_latitude[lat_idx+1].data)
        u10_2 = float(all_u10[time_idx,lat_idx+1,lon_idx].data)
        # 左下
        lon_3 = float(all_longitude[lon_idx+1].data)
        v10_3 = float(all_v10[time_idx,lat_idx,lon_idx+1].data)
        lat_3 = float(all_latitude[lat_idx].data)
        u10_3 = float(all_u10[time_idx,lat_idx,lon_idx+1].data)
        # 右下
        lon_4 = float(all_longitude[lon_idx+1].data)
        v10_4 = float(all_v10[time_idx,lat_idx+1,lon_idx+1].data)
        lat_4 = float(all_latitude[lat_idx+1].data)
        u10_4 = float(all_u10[time_idx,lat_idx+1,lon_idx+1].data)

        for index1 in range(segments):
          for index2 in range(segments):
            lon = (lon_1 * (segments - index1) / segments + lon_2 * index1 / segments) * (segments - index2) / segments + (lon_3 * (segments - index1) / segments + lon_4 * index1 / segments) * index2 / segments
            v10 = (v10_1 * (segments - index1) / segments + v10_2 * index1 / segments) * (segments - index2) / segments + (v10_3 * (segments - index1) / segments + v10_4 * index1 / segments) * index2 / segments
            lat = (lat_1 * (segments - index1) / segments + lat_2 * index1 / segments) * (segments - index2) / segments + (lat_3 * (segments - index1) / segments + lat_4 * index1 / segments) * index2 / segments
            u10 = (u10_1 * (segments - index1) / segments + u10_2 * index1 / segments) * (segments - index2) / segments + (u10_3 * (segments - index1) / segments + u10_4 * index1 / segments) * index2 / segments
            sx, sy = transformer.transform(lat, lon)
            value = math.sqrt(v10 * v10 + u10 * u10)
            maxValue = max( maxValue, value)
            items = [sx - center[0],sy - center[1], v10, u10, value]
            arry.append(items)




for item in arry:
  item[4] = item[4] / maxValue

file.write(json.dumps({
  "array": arry,
  "maxValue": maxValue,
  "center": center
}))
file.close()
print("end")