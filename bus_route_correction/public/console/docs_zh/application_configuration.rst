.. PopulationSim documentation master file
You can adapt this file completely to your liking, but it should at least
contain the root `toctree` directive.

.. |br| raw:: html

   <br />

Application & Configuration 应用 & 配置
===========================

This section describes how to set up a new PopulationSim implementation.
这一节主要介绍了如何配置新的PopulationSim模型。

In order to create a new PopulationSim implementation, the user must first understand the requirements of the project in terms of geographic resolution and details desired in the synthetic population. Once the requirements of the project have been established, the next step is to prepare the inputs to PopulationSim which includes seed population tables and geographic controls. Next, PopulationSim needs to be configured for available inputs and features desired in the final synthetic population. After this, the user needs to run PopulationSim and resolve any data related errors. Finally, the user should validate the output synthetic population against the controls to understand the precision of the synthetic population compared to controls and the amount of variance in the population for each control.
为了创建新的PopulationSim实现，用户首先需要理解项目在地理分辨率方面的要求以及对合成人口期望的详细程度。一旦确立了项目需求，下一步就是准备PopulationSim的输入数据，包括种子人口表和地理控制数据。接着，需要根据可用输入数据和最终合成人口期望的特性对PopulationSim进行配置。此后，用户需要运行PopulationSim并解决任何与数据相关的错误。最后，用户应当将输出的合成人口与控制数据进行比对验证，以理解合成人口相对于控制数据的精确度，以及各控制条件下的人口变异程度。


Selecting Geographies 地理区域选择
---------------------

TAZ - Transportation Analysis Zones

ABMs - Activity-Based travel Models

MAZs - Micro-Analysis Zones

PUMS - Public Use Microdata Sample

PUMAs - Public Use Microdata Areas

ACS - American Community Survey

CTPP - Census Transportation Planning Package

PopulationSim can represent both household and person level controls at multiple geographic levels. Therefore the user must define what geographic units to use for each control. There is not necessarily any 'right' way to define geographic areas or to determine what geographic level to use for each control. However, there are important considerations for selecting geography, discussed below.
PopulationSim 能够在多个地理层级上同时表示家庭层面和个人层面的控制数据。因此，用户必须为每项控制数据定义所使用的地理单元。定义地理区域或确定每项控制数据应使用的地理层级并不存在绝对“正确”的方法。然而，在选择地理区域时，有以下重要考虑因素（下文将详细讨论）


Traditionally, travel forecasting models have followed the sequential four-step model framework. This required the modeling region to be divided into zones, typically the size of census block groups or tracts. The zones used in four-step process are typically known as Transportation Analysis Zones (TAZs). The spatial boundaries of TAZs varies across modeling region and ranges from a city block to a large area in the suburb within a modeling region. If building a synthetic population for a trip-based model, or an activity-based travel models (ABMs) whose smallest geography is the TAZ, then there is no reason to select a smaller geoegraphical unit than the TAZ for any of the controls.
传统上，交通需求预测模型遵循序列式四阶段模型框架。这一框架要求将建模区域划分为多个交通分析小区，其规模通常相当于人口普查区块组或片区。四阶段模型中使用的这些小区通常被称为交通分析小区。TAZ的空间边界在建模区域内各不相同，范围可从城市街区到郊区的大片区域。如果要为基于出行的模型构建合成人口，或为基于活动的交通模型构建合成人口，且其最小地理单元为TAZ，那么在选择任何控制数据的地理单元时，均无需选择比TAZ更小的地理单元。

ABMs operate at the individual level, where travel decisions are modeled explicitly for persons and households in the synthetic population. Many ABMs operate at a finer spatial resolution than TAZs, wherein all location choices (e.g., usual work location, tour destination choice) are modeled at a sub-TAZ geography. This finer geography is typically referred to as Micro-Analysis Zones (MAZs) which are smaller zones nested within TAZs. Models that represent behavior at the MAZ level requires that MAZs are used as the lowest level of control, so that the synthetic population will identify the MAZ that each household resides in.
基于活动的模型在个体层面运行，其模型机制会针对合成人口中的个人与家庭明确模拟出行决策。许多ABM采用比交通分析小区更精细的空间分辨率，其中所有地点选择（例如常规工作地点、出行链目的地选择）都在次TAZ的地理层级上进行模拟。这一更精细的地理单元通常被称为微观分析小区，它们是嵌套在TAZ内部的更小区划。若模型需要在MAZ层面表征行为，则必须将MAZ作为最低层级的控制单元，以便合成人口能够识别每个家庭所居住的具体MAZ。

As discussed earlier, two main inputs to a population synthesizer are a seed sample and controls. The seed sample can come from a household travel survey or from American Community Survey (ACS) Public Use Microdata Sample (PUMS), with latter being the most common source. The PUMS data contains a sample of actual responses to the ACS, but the privacy of each household is protected by aggregating all household residential locations into relatively large regions called Public Use Microdata Areas (PUMAs). PUMAs are special non-overlapping areas that partition each state into contiguous geographic units containing no fewer than 100,000 people each. Some larger regions are composed of many PUMAs, while other, smaller regions have only one PUMA, or may even be smaller than a PUMA. It is not a problem to use PopulationSim to generate a synthetic population if the region is smaller than a PUMA; PopulationSim will 'fit' the PUMA-level population to regional control data as an initial step.
如前所述，人口合成器需要两个主要输入：种子样本和控制数据。种子样本可来源于家庭出行调查或美国社区调查的公共使用微观数据样本，其中后者是最常见的数据源。PUMS数据包含ACS实际调查回复的样本，但为了保护每个家庭的隐私，所有家庭居住位置会被聚合至相对较大的区域，称为公共使用微观数据区。PUMAs是一种特殊的非重叠区域，将每个州划分为连续的地理单元，每个单元至少包含10万人口。一些较大的区域可能包含多个PUMAs，而较小的区域可能仅有一个PUMA，甚至面积小于一个PUMA。如果目标区域小于一个PUMA，使用PopulationSim生成合成人口并不成问题；PopulationSim会以将PUMA层级的人口数据适配至区域控制数据作为初始步骤来完成合成。


Often it is not possible or desirable to specify all the controls at the same level of geographic resolution. Some important demographic, socio-economic and land-use development distributions (e.g., employment or occupation data) which may be adopted for controls are only available at relatively aggregate geographies (e.g., County, District, Region, etc.). Moreover, some distributions which are available at a finer geographic level in the base year may not be available at the same geographic level for a future forecast year. In some cases, even if a control is available at a finer geography, the modeler might want to specify that control (e.g., population by age) at an aggregate geography due to concerns about accuracy, forecastability, etc.
在实际应用中，通常无法或不宜将所有控制数据都设定在相同的地理分辨率层级上。一些重要的人口、社会经济和土地利用发展分布数据（例如就业或职业数据）——这些数据可能被用作控制变量——往往仅能在相对宏观的地理层级（如县、区、区域等）获取。此外，某些在基准年可在更精细地理层级获取的分布数据，在未来的预测年份可能无法在同一地理层级获得。在某些情况下，即使某项控制数据在更精细的地理层级可用，建模者也可能出于对数据准确性、可预测性等方面的考虑，选择在更宏观的地理层级设定该控制（例如按年龄划分的人口数据）。

The flexible number of geographies feature in PopulationSim enables user to make use of data available at different geographic resolutions. In summary, the **choice of geographies for PopulationSim** is decided based on following:
PopulationSim支持多级地理区域的功能使得用户能够利用不同地理分辨率的数据。总而言之，PopulationSim地理单元的选择应基于以下几点确定：

:Travel Model Spatial Resolution交通模型的空间分辨率:
	For most ABMs, this is **MAZ** but can also be **TAZ** or even **Block Group**
    对于大多数基于活动的模型而言，其最小地理单元是微观分析小区(MAZ)，但也可能是交通分析小区，甚至人口普查区块组。

:Availability of Control Data控制数据的可获取与否:
	Different controls are available at different geographic levels; some data is available at the block level (for example, total households), some data is available at the block group level, the tract level, the county level, etc.
    不同的控制数据可在不同的地理层级获取；有些数据（例如总户数）可在区块层面获得，有些数据则在区块组、片区或县等层面提供。

:Accuracy of Control Data控制数据的精确度:
	Generally there is more error in data specified at smaller geographic units than larger geographic units
    一般来说小一些的地理单元的误差会多于大一些的地理单元。

:Desired level of Control期望的控制级别:
	It is possible that the user may not wish to control certain variables at a small geographic level, even if good base-year data were available. For example, the user may not have much faith in the ability to forecast certain variables at a small geogrphic level into the future. In such cases, the user may wish to aggregate available data to larger geographies.
    即使用户能够获取优质的基准年数据，他们也可能不希望在过小的地理层级上控制某些变量。例如，用户可能对于在精细地理层级上预测某些变量未来数值的能力缺乏足够信心。在这种情况下，用户可能希望将可用数据聚合到更大的地理单元进行控制。

:Seed Sample Geography种子样本的地理层级:
	The level at which seed data is specified automatically determines one of the geographic level (the Seed level).
    种子数据所指定的层级会自动决定一个地理层级（即种子层级）。

The hierarchy of geographies is important when making a decision regarding controls. The hierarchy of geographies in PopulationSim framework is as follows:
在确定控制数据的方案时，地理层级的体系结构至关重要。PopulationSim框架中的地理层级体系如下：

  * Meta (e.g., the entire modeling region) 元层级（如整个建模区域）
  * Seed (e.g., PUMA) 种子层级（如PUMA区）
  * Sub-Seed (e.g., TAZ, MAZ)子种子层级（如交通分析小区、微观分析小区）

The Meta geography is the entire region. PopulationSim can handle only one Meta geography. The Seed geography is the geographic resolution of the seed data. There can be one or more Seed geographies. PopulationSim can handle any number of nested Sub-Seed geographies. More information on PopulationSim algorithm can be found from the PopulationSim specifications in the :ref:`docs` section.
元地理层级即整个建模区域。PopulationSim 仅能处理一个元地理层级。种子地理层级由种子数据的地理分辨率决定。可以存在一个或多个种子地理层级。PopulationSim 能够处理任意数量的嵌套子种子地理层级。更多关于 PopulationSim 算法的详细信息，请参阅 :ref:文档 部分中的 PopulationSim 技术规范。

Geographic Cross-walk 地理对应关系文件
~~~~~~~~~~~~~~~~~~~~~

After selecting the geographies, the next step is to prepare a geographic cross-walk file. The geographic cross-walk file defines the hierarchical structure of geographies. The geographic cross-walk is used to aggregate controls specified at a lower geography to upper geography and to allocate population from an upper geography to a lower geography. An example geographic crosswalk is shown below:
选定地理层级后，下一步是准备**地理对应关系文件**。该文件用于定义地理层级的树状结构体系。地理对应关系的作用在于：一方面，可将较低层级设定的控制数据向上聚合至较高层级；另一方面，可将人口从较高层级分配至较低层级。以下是一个地理对应关系文件的示例：


+------+-------------+--------+-------+---------+
| TAZ  | BLOCK GROUP | TRACT  | PUMA  | REGION  |
+======+=============+========+=======+=========+
| 475  | 3           | 100    | 600   | 1       |
+------+-------------+--------+-------+---------+
| 476  | 3           | 100    | 600   | 1       |
+------+-------------+--------+-------+---------+
| 232  | 45          | 100    | 600   | 1       |
+------+-------------+--------+-------+---------+
| 247  | 45          | 202    | 600   | 1       |
+------+-------------+--------+-------+---------+
| 248  | 45          | 202    | 600   | 1       |
+------+-------------+--------+-------+---------+



Preparing seed and control data 准备种子和控制数据
-------------------------------

Seed sample 种子样本
~~~~~~~~~~~

As mentioned in previous section, the seed sample is typically obtained from the ACS PUMS. One of the main requirements for the seed sample is that it should be representative of the modeling region. In the case of ACS PUMS, this can be ensured by selecting PUMAs representing the modeling region both demographically and geographically. PUMA boundaries may not perfectly line up against the modeling region boundaries and overlaps are possible. Each sub-seed geography must be assigned to a Seed geography, and each Seed geography must be assigned to a Meta geography.
如前一节所述，种子样本通常来源于ACS PUMS数据。对种子样本的一个核心要求是，它应能代表建模区域。对于ACS PUMS数据而言，可通过选择在人口特征和地理位置上均能代表建模区域的PUMAs来确保这一点。PUMA的边界可能与建模区域的边界不完全吻合，存在重叠是可能的。在数据处理时，每个子种子地理单元都必须归属于一个种子地理单元，而每个种子地理单元也必须归属于一个元地理单元。

The seed sample must contain all of the specified control variables, as well as any variables that are needed for the travel model but not specified as controls. For population groups that use completely separate, non-overlapping controls, such as residential population and group-quarter population, separate seed samples are prepared. In the ACS PUMS datasets, it is possible to have zero-person households in the raw data table (`NP = 0`); these records must be filtered from the seed data. PopulationSim can be set up and run separately for each population segment using the same geographic system. The outputs from each run can be combined into a unified synthetic population as a post processing step.
种子样本必须包含所有指定的控制变量，以及交通模型所需但未被指定为控制变量的任何其他变量。对于使用完全独立、互不重叠控制变量的不同人口群体（例如常住居民人口和集体居住人口），需要分别准备独立的种子样本。在ACS PUMS原始数据表中，可能会出现零人家庭的记录，这些记录必须从种子数据中筛选剔除。PopulationSim可以为每个细分人口群体进行独立的设置和运行，并采用相同的地理体系。各次运行的输出结果可在后处理步骤中合并为一个统一的合成人口数据集。

Finally, the seed sample must include an initial weight field. The PopulationSim algorithm is designed to assign weights as close to the initial weight as possible to minimize the changes in distribution of uncontrolled variables. All the fields in the seed sample should be appropriately recoded to specify controls (see more details in next section). Household-level population variables must be computed in advance (for e.g., number of workers in each household) and monetary variables must be inflation adjusted to be consistent with year of control data (e.g., Household Income). The ACS PUMS data contain 3 or 5 years of household records, where  each record's income is reported in the year in which it was collected. The ACS PUMS data includes the rolling reference factor for the year and the inflation adjustment factor, these must be used to code each household's income to a common income year.
最后，种子样本必须包含一个初始权重字段。PopulationSim算法的设计目标是在分配权重时尽可能接近初始权重，以最小化非控制变量分布的变化。种子样本中的所有字段都应经过适当的重新编码，以适配控制变量的定义。需要在处理前预先计算家庭层面的人口变量，并将货币变量进行通货膨胀调整，以与控制数据的基准年份保持一致。ACS PUMS数据中包含3年或5年的家庭记录，其中每条记录的家庭收入均以收集年份的币值进行记录。该数据集提供了当年的滚动参考系数和通货膨胀调整因子，必须使用这些因子将每个家庭的收入折算到统一的收入基准年。

Controls 控制
~~~~~~~~

Controls are the marginal distributions that form the constraints for the population synthesis procedure. Controls are also referred to as *targets* and the objective of the population synthesis procedure is to produce a synthetic population whose attributes match these marginal distributions. Controls can be specified for both household and person variables. The choice of control variables depends on the needs of the project. Ideally, the user would want to specify control for all variables that are important determinant of travel behaviour or would be of interest to policy makers. These would include social, demographic, economic and land-use related variables.
控制数据是作为人口合成过程约束条件的边缘分布，也称为目标分布。人口合成流程的目标是生成一个属性特征与这些边缘分布相匹配的合成人口。
控制数据既可以为家庭变量设定，也可以为个人变量设定。控制变量的选择取决于项目需求。理想情况下，用户会希望对所有重要旅行行为决定因素或政策制定者关注的变量都设定控制，这些变量通常包括社会、人口、经济和土地利用相关的指标。

The mandatory requirement for a population synthesizer is to generate the right number of households in each travel model geography. Therefore, it is mandatory to specify a control on total number of households in each geographical unit at the lowest geographical level. If this control is matched perfectly, it ensures that all the upper geographies also have the correct number of households assigned to them.
人口合成器的核心要求是在每个交通模型地理单元中生成正确数量的家庭。因此，必须在最低地理层级为每个地理单元设定家庭总数控制。如果这一控制被完美匹配，就能确保所有上级地理单元也分配到正确的家庭数量。

There are multiple source to obtain input data to build these controls. Most commonly, base-year controls are built from Census data, including Summary Files 1, 2 and 3, the American Community Survey, and the Census Transportation Planning Package (CTPP). Data from Census sources are typically available at one of the Census geographies - Census Block, Block Group, Census Tract, County, Metropolitan Statistical Area, etc. The modeling agency may collect important demographic data for the modeling region (e.g., number of households). Some data can also be obtained from a socio-economic or land-use model for the region such as, households by income groups or households by housing type.
获取构建这些控制数据的输入数据有多个来源。最常见的情况是，基准年控制数据基于人口普查数据构建，包括汇总文件1、2和3、美国社区调查以及人口普查交通规划配套数据。来自人口普查的数据通常可在以下地理层级之一获取：人口普查区块、区块组、普查片区、县、大都市统计区等。建模机构也可能会为建模区域收集重要的人口统计数据（例如家庭数量）。部分数据还可以从该区域的社会经济模型或土地利用模型中获取，例如按收入组划分的家庭数据或按住房类型划分的家庭数据。

Once the data has been obtained, it may be necessary to aggregate or disaggregate the data to the desired geography.
Disaggregation involves distributing data from the upper geography to lower geographies using a distribution based on area, population or number of households. A simple aggregation is possible when the lower geography boundaries fits perfectly within the upper geography boundary. In case of overlaps, data can be aggregated in proportion to the area. A simpler method is to establish a correspondence between the lower and upper geography based on the position of the geometric centroid of the lower geography. If the centroid of the lower geography lies within the upper geography then the whole lower geography is assumed to lie within the upper geography. For some shapes, the geometric centroid might be outside the shape boundary. In such cases, an internal point closest to the geometric centroid but within the shape is used. All Census shape files come with the coordinates of the internal point.  The user would need to download the Census shape files for the associated geography and then establish a correspondence with the desired geography using this methodology. It is recommended that input control data should be obtained at the lowest geography possible and then aggregated to the desired geography. These steps must be performed outside of PopulationSim, typically using a Geographic Information System (GIS) software program or travel modeling software package with GIS capabilities.
获取数据后，可能需要将其聚合或分解至目标地理层级。数据分解涉及根据面积、人口或家庭数量等分布比例，将数据从上级地理单元分配至下级地理单元。如果下级地理单元的边界完全位于上级地理单元边界之内，则可进行简单的数据聚合。若边界存在重叠，则可按面积比例进行聚合。一种更简便的方法是依据下级地理单元的几何中心位置来建立其与上级地理单元的对应关系。若下级地理单元的质心位于某上级地理单元内，则假定整个下级地理单元均属于该上级地理单元。对于某些不规则形状，几何中心可能位于形状边界之外。此时，会使用形状内部最接近几何中心的点。所有人口普查地理边界文件都附带了此内部点的坐标信息。用户需要下载相关地理层级的人口普查边界文件，然后利用此方法建立与目标地理层级的对应关系。建议尽可能在最低地理层级获取输入控制数据，然后将其聚合至目标地理层级。这些步骤必须在PopulationSim外部执行，通常使用地理信息系统软件或具备GIS功能的交通建模软件包来完成。

Control totals within a variable, such as households of size 1, 2, 3, and 4+, should be integerized and smart rounded if necessary since inconsistent controls make convergence more difficult.  For example, if control data is allocated from Census geographies to TAZs, then often floating point controls are created.  To correct this, one can calculate the difference between the floating point controls and integerized versions, and then add the error to the largest category by subtracting it from the other categories.
同一变量内的控制总量（例如家庭规模为1人、2人、3人及4人以上的家庭数量）应进行整数化处理，并在必要时采用智能取整，因为不一致的控制数据会增加模型收敛的难度。例如，若控制数据从人口普查地理单元分配至交通分析小区，通常会生成浮点数形式的控制值。为修正此问题，可计算浮点控制值与整数化版本之间的差值，然后通过将误差从其他类别中减去，并加至最大的类别中进行调整。

Configuration 配置
-------------

Below is PopulationSim's typical directory structure followed by a description of inputs.
以下是PopulationSim典型的目录结构及其输入文件的说明。

  .. image:: images/PopulationSimFolderStructure.png


PopulationSim is run via **run_populationsim.py**. The user needs to first activate the *popsim* environment and then call the *run_populationsim.py* Python script to launch a PopulationSim run.
运行PopulationSim需要通过 run_populationsim.py 脚本执行。用户首先需要激活 popsim 环境，然后调用 run_populationsim.py Python脚本来启动PopulationSim运行。

  ::

   activate popsim
   python run_populationsim.py

PopulationSim is configured using the settings.yaml file. PopulationSim can be configured to run in **regular** mode or **repop** mode.
PopulationSim 通过 settings.yaml 文件进行配置。用户可将其配置为以常规模式或重新合成模式运行。

:regular mode 常规模式:

  The regular configuration runs PopulationSim from beginning to end and produces a new synthetic population.  This can run either single-process or multi-processed to save on runtime.
  常规配置会完整执行PopulationSim的整个流程，并生成一个新的合成人口。该模式既可以单进程运行，也可以多进程运行以缩短运行时间。

:repop mode 重新合成模式:

  The repop configuration is used for repopulating a subset of zones for an existing synthetic population. The user has the option to *replace* or *append* to the existing synthetic population. These options are specified from the settings.yaml file, details can be found in the :ref:`settings` section.
  重新合成配置用于对现有合成人口中的部分区域进行重新合成。用户可以选择替换现有合成人口中的对应部分，或追加新合成的人口。这些选项均在settings.yaml文件中指定，具体细节可参阅 :ref:settings 部分。

The following sections describes the inputs and outputs, followed by discussion on configuring the settings file and specifying controls.
以下章节将介绍输入和输出文件，接着讨论如何配置设置文件及指定控制变量。


.. _inputs_outputs:

Inputs & Outputs 输入和输出
~~~~~~~~~~~~~~~~

Please refer to the following definition list to understand the file names:
请参考以下定义列表以理解文件名中使用的术语：

:*GEOG_NAME*: Sub-seed geography name such as TAZ, MAZ, etc. 子种子地理单元的名称，例如 TAZ（交通分析小区）、MAZ（微观分析小区）等。
:*SEED_GEOG*: Geographic resolution of the seed sample such as PUMA. 种子样本的地理分辨率，例如 PUMA（公共使用微观数据区）。
:*META_GEOG*: Geography name of the Meta geography such as Region, District, etc. 元地理单元的名称，例如 Region（区域）、District（区）等。


--------------------------------------------------------------

Working Directory Contents 工作目录包含的内容:

+-----------------------+--------------------------------------------------------------------------------------------------------+
| File                  | Description                                                                                            |
+=======================+========================================================================================================+
| run_populationsim.py  | Python script that orchestrates a PopulationSim run 用于协调执行PopulationSim运行的Python脚本             |
+-----------------------+--------------------------------------------------------------------------------------------------------+
| /configs              | Sub-directory containing control specifications and configuration settings   存放控制和运行配置文件       |
+-----------------------+--------------------------------------------------------------------------------------------------------+
| /configs_mp           | Sub-directory containing configuration settings for running multi-processed if applicable  多线程配置   |
+-----------------------+--------------------------------------------------------------------------------------------------------+
| /data                 | Sub-directory containing all input files       子目录下存放了所有的输入文件                                |
+-----------------------+--------------------------------------------------------------------------------------------------------+
| /output               | Sub-directory containing all outputs, summaries and intermediate files    存放最终输出，过程和摘要文件     |
+-----------------------+--------------------------------------------------------------------------------------------------------+

--------------------------------------------------------------

*/configs* Sub-directory Contents配置子文件夹下的内容:

+--------------------+-------------------------------------------------------------------+
| File               | Description                                                       |
+====================+===================================================================+
| logging.yaml       | yaml-based file for setting up logging       日志                 |
+--------------------+-------------------------------------------------------------------+
| settings.yaml      | yaml-based settings file to configure a PopulationSim run 配置文件 |
+--------------------+-------------------------------------------------------------------+
| controls.csv       | CSV file to specify controls                控制文件               |
+--------------------+-------------------------------------------------------------------+

--------------------------------------------------------------

*/configs_mp* Sub-directory Contents 多线程配置子文件夹下的内容:

+--------------------+--------------------------------------------------------------------------------+
| File               | Description                                                                    |
+====================+================================================================================+
| settings.yaml      | additional yaml-based settings file for multiprocess running  使用多线程的额外配置|
+--------------------+--------------------------------------------------------------------------------+

--------------------------------------------------------------

*/data* Sub-directory Contents:

+-------------------------------------+----------------------------------------------------------------------+
| File                                | Description                                                          |
+=====================================+======================================================================+
| control_totals_GEOG_NAME.csv        | Marginal control totals at each spatial resolution named *GEOG_NAME* |
+-------------------------------------+----------------------------------------------------------------------+
| control_totals_GEOG_NAME.csv        | 以各空间分辨率（命名为 GEOG_NAME）为单位的边缘控制总量数据
+-------------------------------------+----------------------------------------------------------------------+
| geo_crosswalk.csv                   | Geographic cross-walk file        地理对应关系文件                     |
+-------------------------------------+----------------------------------------------------------------------+
| seed_households.csv                 | Seed sample of households         家庭种子样本                        |
+-------------------------------------+----------------------------------------------------------------------+
| seed_persons.csv                    | Seed sample of persons     个体种子样本                               |
+-------------------------------------+----------------------------------------------------------------------+



--------------------------------------------------------------

*/output* Sub-directory Contents (populated at the end of a PopulationSim run) 输出文件夹（PopulationSim运行完的输出文件）:

This sub-directory is populated at the end of the PopulationSim run. The table below list all possible outputs from a PopulationSim run. The user has the option to specify the output files that should be exported at the end of a run. Details can be found in the *Configuring Settings File* section.
此子目录在 PopulationSim 运行结束时生成。下表列出了 PopulationSim 运行可能产生的所有输出文件。用户可选择指定在运行结束后应导出的输出文件。具体细节请参阅 配置设置文件 部分。

+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| File                            | Group                      | Description                                                                             |
+=================================+============================+=========================================================================================+
| asim.log                        | Logging                    | Log file                           日志                                                    |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| pipeline.h5                     | Data Pipeline              | HDF5 data pipeline which stores all the inputs, outputs and intermediate files    |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| expanded_household_ids.csv      | Final Synthetic Population | List of expanded household IDs with their geographic assignment. User would join |br|   |
|                                 |                            | this file with the seed sample to generate a fully expanded synthetic population        |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| synthetic_households.csv        | Final Synthetic Population | Fully expanded synthetic population of households. User can specify the attributes |br| |
|                                 |                            | to be included from the *seed sample* in the *settings.yaml* file                       |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| synthetic_persons.csv           | Final Synthetic Population | Fully expanded synthetic population of persons. User can specify the attributes to |br| |
|                                 |                            | be included from the *seed sample* in the *settings.yaml* file                          |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| incidence_table.csv             | Intermediate               | Intermediate incidence table                                                            |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| household_groups.csv            | Intermediate               | Unique household group assignments based on controls variables                          |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| GEOG_NAME_control_data.csv      | Intermediate               | Input control data at each geographic level - *GEOG_NAME*                               |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| GEOG_NAME_controls.csv          | Intermediate               | Control totals at each geographic level (*GEOG_NAME*) containing only the controls |br| |
|                                 |                            | specified in the *configs/controls.csv* control specification file                      |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| GEOG_NAME_weights.csv           | Intermediate               | List of household weights with their geographic assignment                              |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| GEOG_NAME_weights_sparse.csv    | Intermediate               | List of household weights with their geographic assignment                              |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| control_spec.csv                | Intermediate               | Control specification used for the run                                                  |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| geo_cross_walk.csv              | Intermediate               | Input geographic cross-walk                                                             |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| crosswalk.csv                   | Intermediate               | Trimmed geographic cross-walk used in PopulationSim run                                 |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| trace_GEOG_NAME_weights.csv     | Tracing                    | Trace file listing household weights for the trace geography specified in settings      |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| summary_hh_weights.csv          | Summary                    | List of household with weights through different stages of PopulationSim                |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| summary_GEOG_NAME.csv           | Summary                    | Marginal Controls vs. Synthetic Population Comparison at *GEOG_NAME* level              |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| summary_GEOG_NAME_aggregate.csv | Summary                    | Household weights aggregate to *SEED_GEOG* at the end of allocation to *GEOG_NAME*      |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+
| summary_GEOG_NAME_SEED_GEOG.csv | Summary                    | Marginal Controls vs. Synthetic Population Comparison at *SEED_GEOG* level using |br|   |
|                                 |                            | weights from allocation at *GEOG_NAME* level                                            |
+---------------------------------+----------------------------+-----------------------------------------------------------------------------------------+

pipeline.h5 - 管道文件，存储所有输入、输出及中间文件的HDF5数据管道

expanded_household_ids.csv - 最终合成的家庭文件，包含已扩展家庭ID及其对应地理分配的列表文件。用户可将此文件与种子样本合并，以生成完整的扩展合成人口。

synthetic_persons.csv - 最终生成的个体文件，完整扩展后的个人合成人口。用户可在 settings.yaml 文件中指定需从 种子样本 中包含的属性字段。

incidence_table.csv - 过程文件，中间关联表

household_groups.csv - 过程文件，基于控制变量生成的家庭组唯一分配结果

GEOG_NAME_control_data.csv - 过程文件，各地理层级（GEOG_NAME）的输入控制数据

GEOG_NAME_controls.csv - 过程文件，各地理层级（GEOG_NAME）的控制总量数据，仅包含 configs/controls.csv 控制规格文件中指定的控制变量。

GEOG_NAME_weights.csv - 过程文件， 附带地理分配信息的家庭权重列表

GEOG_NAME_weights_sparse.csv - 过程文件， 附带地理分配信息的家庭权重列表

control_spec.csv - 过程文件，用于本次运行的控制规格文件

geo_cross_walk.csv - 过程文件，输入的地理对应关系文件
                                                             |
crosswalk.csv - 过程文件，PopulationSim运行中使用的已修整地理对应关系文件

trace_GEOG_NAME_weights.csv - 追踪记录文件（Tracing），列出settings中指定的追踪地理单元的家庭权重的追踪文件。

summary_hh_weights.csv - 摘要文件，列出在PopulationSim不同阶段中家庭权重的文件。

summary_GEOG_NAME.csv - 摘要文件，在 GEOG_NAME 层级的边缘控制数据与合成人口对比结果。

summary_GEOG_NAME_aggregate.csv - 摘要文件，在分配至 GEOG_NAME 层级结束时，家庭权重聚合到 SEED_GEOG 的结果。

summary_GEOG_NAME_SEED_GEOG.csv - 摘要文件，使用 GEOG_NAME 层级分配权重，在 SEED_GEOG 层级的边缘控制数据与合成人口对比结果。


.. _settings:

Configuring Settings File 设置配置文件
~~~~~~~~~~~~~~~~~~~~~~~~~

PopulationSim is configured using the *configs/settings.yaml* file. The user has the flexibility to specify algorithm functionality, list geographies, invoke tracing, provide inputs specifications, select outputs, list the steps to run, and specify multiprocess settings.
PopulationSim 通过 configs/settings.yaml 文件进行配置。用户可以灵活地指定算法功能、列出地理单元、启用追踪功能、提供输入规范、选择输出内容、列出要运行的步骤，并指定多进程设置。


.. note::
   When running PopulationSim, multiple settings files can be specified so long as the ``inherit_settings: True`` setting is included in
   subsequent files.  This feature is used for the multi-processing configuration described below.  To utilize this feature, once can run PopulationSim
   with the following command: ``python run_populationsim.py -c configs_mp -c configs``.  This command specifies two config folders, each with
   a settings file, and the ``configs_mp`` settings inherit from the earlier ``configs`` settings.
   运行 PopulationSim 时，可以指定多个设置文件，前提是后续文件中包含 inherit_settings: True 设置。此功能用于下面描述的多进程配置。要使用此功能，可以通过以下命令运行 PopulationSim：python run_populationsim.py -c configs_mp -c configs  该命令指定了两个配置文件夹（每个都包含一个 settings 文件），其中 configs_mp 的设置会继承之前 configs 的设置。

The settings shown below are from the PopulationSim application for the CALM region as an example of how a run can be configured. The meta geography for CALM region is named as *Region*, the seed geography is *PUMA* and the two sub-seed geographies are *TRACT* and *TAZ*. The settings below are for this four geography application, but the user can configure PopulationSim for any number of geographies and use different geography names.
以下设置示例来自CALM区域的PopulationSim应用，展示了如何配置一个运行实例。在该示例中，CALM区域的元地理层级名为 Region，种子地理层级为 PUMA，两个子种子地理层级分别为 TRACT 和 TAZ。以下设置针对此四层地理结构，但用户可以根据需要为任意数量的地理层级配置PopulationSim，并使用不同的地理名称。

Some of the setting are configured differently for the *repop* mode. The settings specific to the *repop* mode are described in the :ref:`settings_repop` section.  The settings specific to the *multiprocessing* setup are described in the :ref:`settings_mp` section.
部分设置在重新合成模式下有不同的配置。关于 repop 模式特有的设置，请参阅 :ref:settings_repop 部分。有关多处理设置特有的配置，请参见 :ref:settings_mp 部分。


**Algorithm/Software Configuration**:
**算法/软件 配置**:

These settings control the functionality of the PopulationSim algorithm. The settings shown are currently the defaults as they were the ones used to validate the final PopulationSim application for the CALM region. They should not be changed by the casual user, with the possible exception of the max_expansion_factor setting, as explained below.
这些设置控制着 PopulationSim 算法的功能。当前显示的设置为默认值，因为它们曾被用于验证 CALM 区域最终 PopulationSim 应用的准确性。普通用户不应随意更改这些设置，但 max_expansion_factor（最大扩展因子）设置可能例外，具体说明如下。

::

  INTEGERIZE_WITH_BACKSTOPPED_CONTROLS: True
  SUB_BALANCE_WITH_FLOAT_SEED_WEIGHTS: False
  GROUP_BY_INCIDENCE_SIGNATURE: True
  USE_SIMUL_INTEGERIZER: True
  USE_CVXPY: False
  max_expansion_factor: 30
  MAX_BALANCE_ITERATIONS_SIMULTANEOUS: 1000

+--------------------------------------+------------+---------------------------------------------------------------------------------+
| Attribute                            | Value      | Description                                                                     |
+======================================+============+=================================================================================+
| INTEGERIZE_WITH_BACKSTOPPED_CONTROLS | True/False | When set to **True**, upper geography controls are imputed for current |br|     |
|                                      |            | geography and used as additional controls for integerization                    |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| SUB_BALANCE_WITH_FLOAT_SEED_WEIGHTS  | True/False | When **True**, PopulationSim uses floating weights from upper geography         |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| GROUP_BY_INCIDENCE_SIGNATURE         | True/False | When **True**, PopulationSim groups the household incidence by HH group         |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| USE_SIMUL_INTEGERIZER                | True/False | PopulationSim Integerizer can run in two modes: |br|                            |
|                                      |            |      1. Sequential - Zones are processed in a ascending order of number of |br| |
|                                      |            |         households in the zone |br|                                             |
|                                      |            |      2. Simultaneous - Zones are processed simultaneously |br|                  |
|                                      |            |                                                                                 |
|                                      |            | *for more details, refer the TRB paper on Docs page*                            |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| USE_CVXPY                            | True/False | A third-party solver is used for integerization - CVXPY or or-tools |br|        |
|                                      |            | **CVXPY** is currently not available for Windows                                |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| max_expansion_factor                 | > 0        | Maximum HH expansion factor weight setting. This settings dictates the |br|     |
|                                      |            | ratio of the final weight of the household record to its initial weight. |br|   |
|                                      |            | For example, a maxExpansionFactor setting of 5 would mean a household |br|      |
|                                      |            | having a PUMS weight of x can have a final weight of not more than 5x, |br|     |
|                                      |            | thus effectively restricting the number of times a record can be sampled. |br|  |
|                                      |            | The user might need to adjust this setting to enable sampling of a record |br|  |
|                                      |            | with a rare household configuration. Otherwise, it might result in some |br|    |
|                                      |            | controls not being matched due to unavailability of records to sample from.     |
|                                      |            | The maximum expansion factor may have to be adjusted upwards if the target |br| |
|                                      |            | is much greater than the seed number of households.                        |br| |
+--------------------------------------+------------+---------------------------------------------------------------------------------+
| MAX_BALANCE_ITERATIONS_SIMULTANEOUS  | Integer    | Number of list balancer iterations.  The default may be more than is needed.    |
+--------------------------------------+------------+---------------------------------------------------------------------------------+

配置属性 - 取值，简介

INTEGERIZE_WITH_BACKSTOPPED_CONTROLS - True/False，当设置为 True 时，将为当前地理层级推算上级地理控制数据，并将其用作整数化处理的额外控制条件。

SUB_BALANCE_WITH_FLOAT_SEED_WEIGHTS - True/False，当设置为 True 时，PopulationSim 将使用来自上级地理层级的浮点权重。

GROUP_BY_INCIDENCE_SIGNATURE - True/False，当设置为 True 时，PopulationSim 将按家庭组对家庭关联表进行分组处理。

USE_SIMUL_INTEGERIZER - True/False，PopulationSim 整数化器可在两种模式下运行：1.顺序模式 - 按区域家庭数量升序依次处理各个区域;2.并行模式 - 同时处理所有区域.更多详细信息，请参阅文档页面上的 TRB 论文

USE_CVXPY - True/False，设置为True是整数化处理使用了第三方求解器——CVXPY 或 or-tools。CVXPY 目前无法在 Windows 系统上使用。

max_expansion_factor - > 0，最大家庭扩展因子权重设置。此设置决定了家庭记录的最终权重与其初始权重之间的最大比率。例如，将 maxExpansionFactor 设置为 5，意味着初始 PUMS 权重为 x 的家庭，其最终权重不得超过 5x，从而有效限制同一记录被重复抽样的次数。用户可能需要调整此设置，以便能够抽样到具有罕见家庭配置的记录。否则，可能会导致某些控制变量因缺乏可抽样的记录而无法匹配。若目标家庭总数远大于种子家庭数量，则可能需要向上调整最大扩展因子。

MAX_BALANCE_ITERATIONS_SIMULTANEOUS - 整数，列表平衡器的迭代次数。默认值可能超出实际需求。


**Geographic Settings**:
**地理信息设置**:

::

  geographies 地理层级: [REGION, PUMA, TRACT, TAZ]
  seed_geography 种子地理层级（最高层级？）: PUMA

+----------------+---------------------+---------------------------------------------------------------------------------+
| Attribute      | Value               | Description                                                                     |
+================+=====================+=================================================================================+
| geographies    | List of geographies | List of geographies at which the controls are specified including the seed |br| |
|                |                     | geography - PUMA. The geographies should be in the hierarchical order: |br|     |
|                |                     | *REGION* >> *PUMA* >> *TRACT* >> *TAZ* >> ... |br|                              |
|                |                     | Any number of geographies are allowed |br|                                      |
|                |                     | These geography names should be used as prefixes in control data file names |br||
|                |                     | for the corresponding geographies. Note that number of sub-seed geographies |br||
|                |                     | are flexible. Each must be listed in the run_list settings, shown below.        |
+----------------+---------------------+---------------------------------------------------------------------------------+
| seed_geography | PUMA                | Seed geography name from the list of geographies                                |
+----------------+---------------------+---------------------------------------------------------------------------------+

geographies - 地理层级列表，指定控制数据的地理层级列表，包括种子地理层级（如 PUMA）。地理层级应按树形结构顺序排列：REGION > PUMA > TRACT > TAZ > ... 允许包含任意数量的地理层级。这些地理层级的名称应作为对应层级控制数据文件名的前缀。请注意，子种子地理层级的数量是灵活的，但每个都必须在下文所示的 run_list 设置中列出。

seed_geography - PUMA，从地理层级列表中指定的种子地理层级名称。


**Tracing**:
**追踪功能**:

Currently, only one unit can be listed. Only geographies below the seed geography can be traced.
目前只能列出一个单元。只有种子地理层级以下的层级才能被追踪。

::

  trace_geography:
	TAZ: 100
	TRACT: 10200

+-----------+-----------------------------------------------------+
| Attribute | Description                                         |
+===========+=====================================================+
| TAZ       | TAZ ID that should be traced. 应被追踪的交通分析小区ID。|
+-----------+-----------------------------------------------------+
| TRACT     | TRACT ID that should be traced.应被追踪的普查片区ID。   |
+-----------+-----------------------------------------------------+

**data directory**:
**数据目录**:

::

  data_dir: data

+-----------+---------------------------------------------------------------------------------+
| Attribute | Description                                                                     |
+===========+=================================================================================+
| data_dir  | Name of the data_directory within the working directory. Do not change unless   |
|           | the directory structure changes from the template.                              |
+-----------+---------------------------------------------------------------------------------+

data_dir 工作目录内的数据目录名称。除非目录结构相对于模板发生变更，否则请勿修改。


**Input Data Tables**
**输入数据表**

This setting is used to specify details of various inputs to PopulationSim. Below is the list of the inputs in the PopulationSim data pipeline:
此设置用于指定PopulationSim各项输入数据的详细信息。以下是PopulationSim数据管道中输入的列表：


	* Seed-Households 种子家庭数据
	* Seed-Persons 种子个体（人）数据
	* Geographic CrossWalk 地理对应关系文件
	* Control data at each control geography 各控制地理层级的控制数据


Note that Seed-Households, Seed-Persons and Geographic CrossWalk are all required tables and must be listed. There must be a control data file specified for each geography other than seed. For each input table, the user is required to specify an import table name, input CSV file name, index column name and column name map (only for renaming column names). The user can also specify a list of columns to be dropped from the input synthetic population seed data. An example is shown below followed by description of attributes.
请注意，种子家庭数据、种子个人数据和地理对应关系文件均为必需的表，必须列出。对于种子地理层级以外的每个地理层级，都必须指定一个控制数据文件。对于每个输入表，用户需要指定导入表名、输入CSV文件名、索引列名以及列名映射（仅用于重命名列）。用户还可以指定要从输入的合成人口种子数据中删除的列列表。以下是一个示例，随后是对各属性的说明。

::

	input_table_list:
	- tablename: households
		filename : seed_households.csv
		index_col: hh_id
		rename_columns:
		hhnum: hh_id
	- tablename: persons
		filename : seed_persons.csv
		rename_columns:
		hhnum: hh_id
		SPORDER: per_num
		# drop mixed type fields that appear to have been incorrectly generated
		drop_columns:
		- indp02
		- naicsp02
		- occp02
		- socp00
		- occp10
		- socp10
		- indp07
		- naicsp07
	- tablename: geo_cross_walk
		filename : geo_cross_walk.csv
		rename_columns:
		TRACTCE: TRACT
	- tablename: TAZ_control_data
		filename : control_totals_taz.csv
	- tablename: TRACT_control_data
		filename : control_totals_tract.csv
	- tablename: REGION_control_data
		filename : scaled_control_totals_meta.csv

+--------------+---------------------------------------------------------------------------------------+
| Attribute    | Description                                                                           |
+==============+=======================================================================================+
| tablename    | Name of the imported CSV file in the PopulationSim data pipeline. The input |br|      |
|              | names in the PopulationSim data pipeline should be named as per the following |br|    |
|              | standard: |br|                                                                        |
|              | 1. Seed-Households - *households* |br|                                                |
|              |                                                                                       |
|              |    Households across all Seed geographies should be in one file. There should be |br| |
|              |    a Seed geography field with name as specified in the settings file. The seed  |br| |
|              |    geography identifies which Seed geography unit each household belongs to           |
|              |                                                                                       |
|              | 2. Seed-Persons - *persons* |br|                                                      |
|              |                                                                                       |
|              |    Persons across all Seed geographies should be in one file. There should be a |br|  |
|              |    Seed geography field with name as specified in the settings file. The seed  |br|   |
|              |    geography identifies which Seed geography unit each person belongs to              |
|              |                                                                                       |
|              | 3. Geographic CrossWalk - *geo_cross_walk* |br|                                       |
|              |                                                                                       |
|              |    The field names in the geographic cross-walk should be same as the geography |br|  |
|              |    names specified in the settings file                                               |
|              |                                                                                       |
|              | 4. Control data at each control geography - *GEOG_NAME_control_data*, |br|            |
|              |    where *GEOG_NAME*  is the name of the control geography (TAZ, TRACT and REGION)    |
|              |                                                                                       |
+--------------+---------------------------------------------------------------------------------------+
| filename     | Name of the input CSV file in the data folder                                         |
+--------------+---------------------------------------------------------------------------------------+
| index_col    | Name of the unique ID field in the seed household data                                |
+--------------+---------------------------------------------------------------------------------------+
| rename_columns   | Column map of fields to be renamed. The format for the column map is as follows: |br| |
|              | ``Name in CSV: New Name``                                                             |
+--------------+---------------------------------------------------------------------------------------+
| drop_columns | List of columns to be dropped from the input data                                     |
+--------------+---------------------------------------------------------------------------------------+

属性  - 简介

tablename - 在PopulationSim数据管道中导入的表名。输入名称应遵循以下标准：1. *households* - households 所有种子地理层级的家庭数据应合并于一个文件中。需包含一个种子地理字段，其名称应与设置文件中指定的名称一致。该字段用于标识每个家庭所属的种子地理单元。2. *persons*  - persons 所有种子地理层级的个人数据应合并于一个文件中。需包含一个种子地理字段，其名称应与设置文件中指定的名称一致。该字段用于标识每个人所属的种子地理单元。3. 地理对应关系文件 - geo_cross_walk 地理对应关系文件中的字段名应与设置文件中指定的地理层级名称一致。4. 各控制地理层级的控制数据 - GEOG_NAME_control_data，其中 GEOG_NAME 是控制地理层级的名称（例如TAZ、TRACT和REGION）。

filename - 数据目录下csv格式的文件名。

index_col - 种子家庭数据中唯一ID字段的名称。

rename_columns - 需要重命名的字段列映射。列映射的格式为：CSV中的名称: 新名称

drop_columns - 要从输入数据中删除的列的列表。


PopulationSim requires that the column names must be unique across all the control files. In case there are duplicate column names in the raw control files, user can use the column map feature to rename the columns appropriately.
PopulationSim 要求所有控制文件中的列名必须是唯一的。如果原始控制文件中存在重复的列名，用户可以使用列映射功能对列进行适当重命名。

**Reserved Column Names**:
**保留列名**:

Three columns representing the following needs to be specified:
需要指定以下三列：


- Initial weight on households 家庭的初始权重
- Unique household identifier 唯一的家庭标识符
- Control on total number of households at the lowest geographic level 最低地理层级的家庭总数控制

::

  household_weight_col: WGTP
  household_id_col: hh_id
  total_hh_control: num_hh

+------------------------+--------------------------------------------------------------------------+
| Attribute              | Description                                                              |
+========================+==========================================================================+
| household_weight_col   | Initial weight column in the household seed sample                       |
+------------------------+--------------------------------------------------------------------------+
| household_id_col       | Unique household ID column in the household seed sample used to |br|     |
|                        | identify which persons are in which household. Should have same |br|     |
|                        | name as the index column on household seed table                         |
+------------------------+--------------------------------------------------------------------------+
| total_hh_control       | Total number of household control at the lowest geographic level.  |br|  |
|                        | Note that PopulationSim requires this control to be specified at the |br||
|                        | lowest geography. It is strictly enforced                                |
+------------------------+--------------------------------------------------------------------------+

household_weight_col - 家庭种子样本中的初始权重列。

household_id_col - 用于标识个人属于哪个家庭的唯一家庭ID列，应与家庭种子表的索引列名称一致。

total_hh_control - 最低地理层级的家庭总数控制列。请注意，PopulationSim 严格要求此控制必须在最低地理层级指定。


**Control Specification File Name**:
**控制规格文件名**:

The control specification file is specified using a different token name for the repop mode as shown below.
重新合成模式使用不同的令牌名称来指定控制规格文件，如下所示。

::

  control_file_name: controls.csv

+---------------------+--------------------------------------------+
| Attribute           | Description                                |
+=====================+============================================+
| control_file_name   | Name of the CSV control specification file |
+---------------------+--------------------------------------------+

control_file_name - CSV控制文件的名称。


**Output Tables**:
**输出表**:

The ``output_tables:`` setting is used to control which outputs to write to disk. The :ref:`inputs_outputs` section listed all possible outputs. The user can specify either a list of output tables to include or to skip using the *action* attribute as shown below in the example. if neither is specified, then all output tables will be written. The HDF5 data pipeline and all summary files are written out regardless of this setting.
输出表设置用于控制将哪些输出结果写入磁盘。在 :ref:inputs_outputs 部分列出了所有可能的输出。用户可以通过 action 属性指定是要包含还是跳过输出表列表，如下例所示。如果未指定，则将写入所有输出表。无论此设置如何，HDF5数据管道和所有汇总文件都会被写入

::

  output_tables:
    action: include
    tables:
      - expanded_household_ids

+------------+---------------------------------------------------+
| Attribute  | Description                                       |
+============+===================================================+
| action     | *include* or *skip* the list of tables specified  |
+------------+---------------------------------------------------+
| tables     | List of table to be written out or skipped        |
+------------+---------------------------------------------------+

action - 接受*include* 或者 *skip*作为输入配置
tables - 要保留或跳过的文件的列表

**Synthetic Population Output Specification**

**合成的人口输出的细节配置**

This setting allows the user to specify the details of the expanded synthetic population. User can specify the output file names, household ID field name and the set of columns to be included from the seed sample.
此设置允许用户指定扩展合成人口输出的详细信息。用户可以指定输出文件名、家庭ID字段名称以及要从种子样本中包含的列集合。

::

  output_synthetic_population:
    household_id: household_id
    households:
      filename: synthetic_households.csv
      columns:
        - NP
        - AGEHOH
        - HHINCADJ
        - NWESR
    persons:
      filename: synthetic_persons.csv
      columns:
        - per_num
        - AGEP
        - OSUTAG
        - OCCP


+--------------+------------------------------------------------------------------------------------+
| Attribute    | Description                                                                        |
+==============+====================================================================================+
| household_id | Column name of the unique household ID field in the expanded synthetic population  |
+--------------+------------------------------------------------------------------------------------+
| filename     | CSV file names for the expanded households and persons table                       |
+--------------+------------------------------------------------------------------------------------+
| columns      | Names of seed sample columns to be included in the final synthetic population. |br||
|              | Missing or misspelled column names generate error. The geographic allocation |br|  |
|              | information of each household is added by default.                                 |
+--------------+------------------------------------------------------------------------------------+

household_id - 扩展合成人口中唯一家庭ID字段的列名。

filename - 扩展后的家庭表和个人表的CSV文件名。

columns - 要包含在最终合成人口中的种子样本列名称。缺失或拼写错误的列名会导致报错。每个家庭的地理分配信息默认会自动添加。


**Steps for regular mode**:

**常规模式下的步骤**:

This setting lists the sub-modules or steps to be run by the PopulationSim orchestrator. The ActivitySim framework allows user to resume a PopulationSim run from a specific point. This is specified using the attribute ``resume_after``. The step, ``sub_balancing.geography`` is repeated for each sub-seed geography (the example below shows two, but there can be 0 or more).
此设置列出了由 PopulationSim 编排器运行的子模块或步骤。ActivitySim 框架允许用户从特定点恢复 PopulationSim 运行。这是通过 resume_after 属性指定的。步骤 sub_balancing.geography 会为每个子种子地理层级重复执行（下面的示例显示有两个，但可以有 0 个或多个）。

::

  run_list:
    steps:
      - input_pre_processor
      - setup_data_structures
      - initial_seed_balancing
      - meta_control_factoring
      - final_seed_balancing
      - integerize_final_seed_weights
      - sub_balancing.geography=TRACT
      - sub_balancing.geography=TAZ
      - expand_households
      - write_results
      - summarize

    #resume_after: integerize_final_seed_weights

+----------------+---------------------------------------------------+
| Attribute      | Description                                       |
+================+===================================================+
| steps          | List of steps to be run                           |
+----------------+---------------------------------------------------+
| resume_after   | The step from which the current run should resume |
+----------------+---------------------------------------------------+

steps - 按顺序运行的列表

resume-after - 当前运行应从哪个步骤恢复。


For detailed information on software implementation refer to :ref:`core_components` and :ref:`model_steps`. The table below gives a brief description of each step.

关于软件运行的详细信息，请参阅 :ref:core_components 和 :ref:model_steps。下表对每个步骤进行了简要说明。


+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Step                                 | Description                                                                                                                                                       |
+======================================+===================================================================================================================================================================+
| :ref:`input_pre_processor`           | Read input text files and save them as pipeline tables for use in subsequent steps.                                                                               |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`setup_data_structures`         | Builds data structures such as incidence_table.                                                                                                                   |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`initial_seed_balancing`        | Balance the household weights for each of the seed geographies (independently) using the seed level controls and the aggregated sub-zone controls totals.         |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`meta_control_factoring`        | Apply simple factoring to summed household fractional weights based on original meta control values relative to summed household fractional weights by meta zone. |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`final_seed_balancing`          | Balance the household weights for each of the seed geographies (independently) using the seed level controls and the aggregated sub-zone controls totals.         |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`integerize_final_seed_weights` | Final balancing for each seed (puma) zone with aggregated low and mid-level controls and distributed meta-level controls.                                         |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`sub_balancing`                 | Simul-balance and integerize all zones at a specified geographic level in groups by parent zone.                                                                  |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`expand_households`             | Create a complete expanded synthetic household list with their assigned geographic zone ids.                                                                      |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`write_tables`                  | Write pipeline tables as csv files (in output directory) as specified by output_tables list in settings file.                                                     |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`write_synthetic_population`    | Write synthetic households and persons tables to output directory as csv files.                                                                                   |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| :ref:`summarize`                     | Write aggregate summary files of controls and weights for all geographic levels to output dir                                                                     |
+--------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------+


:ref:`input_pre_processor` - 读取输入的文本文件并将其保存为管道表，供后续步骤使用。

:ref:`setup_data_structures` - 构建数据结构，例如关联表（incidence_table）。

:ref:`initial_seed_balancing` - 使用种子层级的控制数据和聚合的子区域控制总量，（独立地）平衡每个种子地理单元的家庭权重。

:ref:`meta_control_factoring` -根据原始元控制值与按元区域汇总的家庭小数权重之间的比例，应用简单因子调整家庭分数权重。

:ref:`final_seed_balancing` - 使用种子层级的控制数据和聚合的子区域控制总量，（独立地）平衡每个种子地理单元的家庭权重。

:ref:`integerize_final_seed_weights` - 利用聚合的低层级及中层级的控制数据以及分配后的元层级控制数据，对每个种子（例如 PUMA）区域进行最终的权重平衡。

:ref:`sub_balancing` - 通过按父区域分组的方式，对指定地理层级的所有区域进行同步平衡与整数化处理。

:ref:`expand_households` - 生成一个完整的、附带地理区域ID分配信息的扩展合成家庭列表。

:ref:`write_tables` - 将管道表按设置文件中 output_tables 列表的指定，写入CSV文件（位于输出目录）。

:ref:`write_synthetic_population` - 将合成家庭表和人员表以CSV文件形式写入输出目录。

:ref:`summarize` - 将所有地理层级的控制数据和权重的聚合汇总文件写入输出目录。


.. _settings_mp:

Configuring Settings File for Multiprocessing 多进程模式下的配置文件设置
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This sections describes the settings that are additionally configured for running PopulationSim with multiprocessing to reduce runtime.  PopulationSim uses ActivitySim's multiprocessing capabilities, which are described in more detail `here <https://activitysim.github.io/activitysim/howitworks.html#multiprocessing>`_.
本章节描述了为以多处理模式运行 PopulationSim（以减少运行时间）而需额外进行的设置。PopulationSim 利用了 ActivitySim 的多处理功能，更详细的说明请参阅 此处 <https://activitysim.github.io/activitysim/howitworks.html#multiprocessing>_。

The example below can be found in the ``example_calm\configs_mp\settings.yaml`` file.  The group of model steps identified as ``mp_seed_balancing`` and starting with ``input_pre_processor`` are run single process until the next group of model steps identified as ``mp_sub_balancing_TAZ`` and starting with
``sub_balancing.geography=TAZ`` is reached, at which time PopulationSim runs these steps in parallel using two processors
by slicing the problem into separate geographic batches based on the ``slice_geography: TRACT`` setting.  It then
returns to single process with the final group of model steps identified as ``mp_summarize`` and
beginning with ``expand_households``.
下面的示例可在 example_calm\configs_mp\settings.yaml 文件中找到。被标识为 mp_seed_balancing、从 input_pre_processor 开始的这组模型步骤以单进程运行，直到遇到下一组被标识为 mp_sub_balancing_TAZ、从 sub_balancing.geography=TAZ 开始的模型步骤。此时，PopulationSim 会根据 slice_geography: TRACT 设置，将问题按地理区域切分成独立的批次，使用两个处理器并行运行这些步骤。随后，它返回到单进程，执行最后一组被标识为 mp_summarize、从 expand_households 开始的模型步骤。


::

  inherit_settings: True
  multiprocess: True
  num_processes: 2
  cleanup_pipeline_after_run: True
  slice_geography: TRACT

  multiprocess_steps:
    - name: mp_seed_balancing
      begin: input_pre_processor
    - name: mp_sub_balancing_TAZ
      begin: sub_balancing.geography=TAZ
      num_processes: 2
      slice:
        tables:
          - slice_crosswalk
          - crosswalk
        # don't slice any tables not explicitly listed above in slice.tables
        except: True
        # the following tables are added by sub_balancer and should be coalesced
        coalesce:
          - TAZ_weights
          - TAZ_weights_sparse
          - trace_TAZ_weights
    - name: mp_summarize
      begin: expand_households


+-------------------------------+--------------------------------------------------------------------------------------------------------------+
| Attribute                     | Description                                                                                                  |
+===============================+==============================================================================================================+
| inherit_settings              | True means this settings file inherits settings from settings file(s) identified earlier in the run command  |
+-------------------------------+--------------------------------------------------------------------------------------------------------------+
| num_processes                 | Number of processors to use for multiprocessing                                                              |
+-------------------------------+--------------------------------------------------------------------------------------------------------------+
| cleanup_pipeline_after_run    | Removes multiprocess process specific intermediate pipelines at the end of the run if desired                |
+-------------------------------+--------------------------------------------------------------------------------------------------------------+
| slice_geography               | The geography used to separate the problem into parallel geographic batches for balancing                    |
+-------------------------------+--------------------------------------------------------------------------------------------------------------+
| multiprocess_steps            | Specifies which steps to run single process and multiprocess                                                 |
+-------------------------------+--------------------------------------------------------------------------------------------------------------+

inherit_settings - True 表示此设置文件继承自运行命令中较早指定的设置文件中的配置。

num_processes - 设置用于多进程的CPU核数

cleanup_pipeline_after_run - 如果启用，将在运行结束时删除多处理过程中各进程特定的中间管道数据。

slice_geography - 用于将问题划分为并行地理批次以进行平衡处理的地理层级。

multiprocess_steps - 指定哪些步骤以单进程运行，哪些步骤以多进程运行。


.. _settings_repop:

Configuring Settings File for repop Mode重新合成模式下的配置文件设置
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This sections describes the settings that are configured differently for the *repop* mode.
本章节描述了 repop 模式下需要进行不同配置的设置。

**Input Data Tables for repop mode**

**重新合成模式下的输入数据表**

The repop mode runs over an existing synthetic population and uses the data pipeline (HDF5 file) from the regular run as an input. User should copy the HDF5 file from the regular outputs to the *output* folder of the repop set up. The data input which needs to be specified in this setting is the control data for the subset of geographies to be modified. Input tables for the repop mode can be specified in the same manner as regular mode. However, only one geography can be controlled and the geography must be the lowest in "geographies" setting. In the example below, TAZ controls are specified. The controls specified in TAZ_control_data do not have to be consistent with the controls specified in the data used to control the initial population. Only those geographic units to be repopulated should be specified in the control data (for example, TAZs 314 through 317).

重新合成模式基于现有的合成人口运行，并使用常规运行产生的数据管道文件作为输入。用户应将常规运行输出的HDF5文件复制到重新合成模式设置的输出文件夹中。在此设置中需要指定的数据输入是待修改地理子集的控制数据。重新合成模式的输入表可以按照与常规模式相同的方式指定。然而，只能控制一个地理层级，且该层级必须是“geographies”设置中的最低层级。在下面的示例中，指定的是TAZ控制数据。在 TAZ_control_data 中指定的控制数据无需与用于控制初始人口的数据中指定的控制数据保持一致。控制数据中只应指定那些需要重新合成的地理单元（例如，TAZ 314至317）

::

  repop_input_table_list:
    - taz_control_data:
      filename : repop_control_totals_taz.csv
      tablename: TAZ_control_data


**Control Specification File Name for repop mode**:

**重新合成模式下的控制规格文件名**:

::

  repop_control_file_name: repop_controls.csv

+---------------------------+-------------------------------------------------------------+
| Attribute                 | Description                                                 |
+===========================+=============================================================+
| repop_control_file_name   | Name of the CSV control specification file for repop mode   |
|                           | Must include total_hh_control field                         |
|                           | 重新合成模式下CSV控制规格文件的名称。必须包含total_hh_control 字段。|
+---------------------------+-------------------------------------------------------------+


**Output Tables for repop mode**:

**重新合成模式下的输出表**:

It should be noted that only the summary_GEOG_NAME.csv summary file is available for the repop mode.
需要注意到是，在重新合成模式下只有summary_GEOG_NAME.csv这个摘要文件。

**Steps for repop mode**:

**重新合成模式下的步骤**:

When running PoulationSim in repop mode, the steps specified in this setting are run. As mentioned earlier, the repop mode runs over an existing synthetic population. The default value for the ``resume_after`` setting under the repop mode is *summarize* which is the last step of a regular run. In other words, the repop mode starts from the last step of the regular run and modifies the regular synthetic population as per the new controls. The user can choose either *append* or *replace* in the ``expand_households.repop`` attribute to modify the existing synthetic population. The *append* option adds to the existing synthetic population in the specified geographies, while the *replace* option replaces any existing synthetic population with newly synthesized population in the specified geographies.
在重新合成模式下运行PopulationSim时，将执行此设置中指定的步骤。如前所述，重新合成模式基于现有的合成人口运行。重新合成模式下 resume_after 设置的默认值为 summarize，即常规运行的最后一步。换句话说，重新合成模式从常规运行的最后一个步骤开始，并根据新的控制数据修改常规合成人口。用户可以在 expand_households.repop 属性中选择 append 或 replace 来修改现有的合成人口：append 选项：在指定地理单元中向现有合成人口追加新合成的人口；replace 选项：在指定地理单元中用新合成的人口替换任何现有合成人口。

::

   run_list:
     steps:
       - input_pre_processor.repop
       - repop_setup_data_structures
       - initial_seed_balancing.final=true
       - integerize_final_seed_weights.repop
       - repop_balancing
       # expand_households options are append or replace
       - expand_households.repop;replace
       - summarize.repop
       - write_synthetic_population.repop
       - write_tables.repop

     resume_after: summarize

+----------------+--------------------------------------------------------+
| Attribute      | Description                                            |
+================+========================================================+
| steps          | List of steps to be run |br|                           |
|                | Two options for the expand_households.repop step |br|  |
|                | 1. append |br|                                         |
|                | 2. replace                                             |
+----------------+--------------------------------------------------------+
| resume_after   | The step from which the current run should resume      |
+----------------+--------------------------------------------------------+

steps - 要运行的步骤列表。expand_households.repop 步骤有两个选项：1. append 2. replace。
resume_after - 当前运行应从哪个步骤恢复。

For information on software implementation of repop balancing refer to :ref:`repop_balancing`.
关于重新合成平衡的软件实现信息，请参阅 :ref:repop_balancing。

.. _settings_weighting:

How to prepare PopulationSim inputs for survey weighting 如何为调查的权重准备PopulationSim的输入
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The main difference in the seed sample for population synthesis and survey weighting is that in case of survey weighting the geographic allocation is known. PopulationSim operates at multiple geographies and performs geographic allocation of the sample to match controls at lower geographies. Since it is undesirable to change geographic allocation in case of survey weighting, controls should be specified only at one geographic level – the seed geography.  All the other inputs must be prepared in the same fashion as for population synthesis.
用于人口合成与调查加权的种子样本主要区别在于，在调查加权中，地理分配是已知的。PopulationSim 在多个地理层级上运行，并对样本进行地理分配以匹配更低层级地理单元的控制数据。由于在调查加权中通常不希望改变地理分配，因此应仅在种子地理层级指定控制数据。所有其他输入数据的准备方式必须与人口合成保持一致。


**Configuring PopulationSim for survey weighting**:
**为调查加权配置 PopulationSim**:

Since survey weighting does not involve expanding the survey sample, integerization is not needed. Integerization can be skipped by switching off integerization in the yaml settings file as follows:
由于调查加权不涉及扩展调查样本，因此不需要进行整数化。可以通过在 YAML 设置文件中关闭整数化来跳过此步骤，具体如下：

::

  NO_INTEGERIZATION_EVER: True

User may want to specify the maximum and minimum limit on expansion of initial weights in the yaml settings file as follows:
用户可能需要在 YAML 设置文件中指定初始权重扩展的最大和最小限制，如下所示：

::

  max_expansion_factor: 4 # Default is 30
  min_expansion_factor: 0.5

The desired output for survey weighting is a list of final weights by household ID. In order to achieve this, the grouping of incidence must be switched off in the yaml settings file as follows:
调查加权所需的输出是按家庭ID列出的最终权重列表。为此，必须在YAML设置文件中关闭关联表分组功能，具体设置如下：

::

  GROUP_BY_INCIDENCE_SIGNATURE: False


**Output Tables for weighting mode**:

**加权模式下的输出表**:

To obtain the final weights by household ID, the seed geography weights table must be specified in the yaml settings file as below:
为获取按家庭ID的最终权重，必须在YAML设置文件中指定种子地理权重表，具体如下：


::

  output_tables:
    action: include
    tables:
      - seed_geography_weights
      ...

The seed_geography_weights file contains the following columns:
seed_geography_weights文件包含了以下的数据列：

::

  HH_ID
  SeedGeog_ID
  preliminary_balanced_weight (weight after initial seed balancing)
  sample_weight (initial sample weight)
  balanced_weight (weight after final seed balancing)

**Notes for weighting mode**:

**权重模式下的注意事项**:

- If there are no meta controls, the preliminary and final balanced weights are same.
- It should be noted that under NO_INTEGERIZATION_EVER mode the expanded_household_ids file is empty.
如果未设定元控制，则初步平衡权重与最终平衡权重相同。
需注意，在 NO_INTEGERIZATION_EVER 模式下，expanded_household_ids 文件为空。


Specifying Controls指定控制项
~~~~~~~~~~~~~~~~~~~

The controls for a PopulationSim run are specified using the control specification CSV file. Following the ActivitySim framework, Python expressions are used for specifying control constraints.  An example file is below.
PopulationSim 运行的控制项通过控制规格 CSV 文件来指定。遵循 ActivitySim 框架，使用 Python 表达式来定义控制约束。以下是一个示例文件。

+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| target               | geography | seed_table | importance | control_field |  expression                                                              |
+======================+===========+============+============+===============+==========================================================================+
| num_hh               | TAZ       | households | 100000000  | HHBASE        | (households.WGTP > 0) & |br| (households.WGTP < np.inf) [#]_             |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| hh_size_4_plus       | TAZ       | households | 5000       | HHSIZE4       | households.NP >= 4                                                       |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| hh_age_15_24         | TAZ       | households | 500        | HHAGE1        | (households.AGEHOH > 15) & |br| (households.AGEHOH <= 24)                |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| hh_inc_15            | TAZ       | households | 500        | HHINC1        | (households.HHINCADJ > -999999999) & |br| (households.HHINCADJ <= 21297) |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| student_fam_housing  | TAZ       | persons    | 500        | OSUFAM        | persons.OSUTAG == 1                                                      |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| hh_wrks_3_plus       | TRACT     | households | 1000       | HHWORK3       | households.NWESR >= 3                                                    |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| hh_by_type_sf        | TRACT     | households | 1000       | SF            | households.HTYPE == 1                                                    |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+
| persons_occ_8        | REGION    | persons    | 1000       | OCCP8         | persons.OCCP == 8                                                        |
+----------------------+-----------+------------+------------+---------------+--------------------------------------------------------------------------+





目标 - 地理层级 - 种子表 - 重要性 - 控制字段 - 判定条件
num_hh - TAZ - households - 100000000 - HHBASE - (households.WGTP > 0) & (households.WGTP < np.inf)

hh_size_4_plus - TAZ - households - 5000 - HHSIZE4 - households.NP >= 4

hh_age_15_24  - TAZ - households - 500 - HHAGE1 - (households.AGEHOH > 15) & |br| (households.AGEHOH <= 24)

hh_inc_15 - TAZ - households - 500 - HHINC1 - (households.HHINCADJ > -999999999) & |br| (households.HHINCADJ <= 21297)

student_fam_housing - TAZ - persons - 500 - OSUFAM - persons.OSUTAG == 1

hh_wrks_3_plus - TRACT - households - 1000 - HHWORK3 - households.NWESR >= 3

hh_by_type_sf - TRACT - households - 1000 - SF - households.HTYPE == 1

persons_occ_8 - REGION - persons - 1000 - OCCP8 - persons.OCCP == 8



.. [#] np.inf is the NumPy constant for infinty

Attribute definitions are as follows:
属性定义如下:

:target:
        target is the name of the control in PopulationSim. A column by this name is added to the seed table. Note that the ``total_hh_control:`` target must be present in the control specification file. All other controls are flexible. The target names should be unique even if they are for different geographies.
        target 是 PopulationSim 中控制项的名称。具有此名称的列会被添加到种子表中。请注意，total_hh_control: 目标必须出现在控制规格文件中。所有其他控制项是灵活的。即使针对不同的地理层级，目标名称也应是唯一的。
:geography:
        geography is the geographic level of the control, as specified in ``geographies``.
        geography 是控制项的地理层级，与 geographies 中的指定一致。
:seed_table:
        seed_table is the seed table the control applies to and it can be ``households`` or ``persons``.  If persons, then persons are aggregated to households using the count operator.
        seed_table 是控制项所应用的种子表，可以是 households 或 persons。如果指定为 persons，则会使用计数操作符将个人聚合到家庭层面。
:importance:
        importance is the importance weight for the control. A higher weight will cause PopulationSim to attempt to match the control at the possible expense of matching lower-weight controls. The importance weights are described in more detail in the :ref:`importance` and :ref:`setting-importance` sections.
        importance 是控制项的重要性权重。较高的权重将导致 PopulationSim 尝试匹配该控制项，但可能会以牺牲较低权重控制项的匹配为代价。重要性权重的更详细说明请参阅 :ref:importance 和 :ref:setting-importance 部分。
:control_field:
        control_field is the field in the control data input files that this control applies to. Note that the control field names should be unique even if they are for different geographies.
        control_field 是此控制项在控制数据输入文件中对应的字段名称。请注意，即使针对不同的地理层级，控制字段名称也应是唯一的。
:expression:
        expression is a valid Python/Pandas expression that identifies seed households or persons that this control applies to. The household and persons fields used for creating these expressions should exist in the seed tables. User might need to pre-process the seed sample to create the variable required in these expressions. These expressions can be specified for both discrete and continuous variables. For most applications, this involves creating logical relationships such as equalities, inequalities and ranges using the standard logical operators (AND, OR, EQUAL, Greater than, less than).
        expression 是一个有效的 Python/Pandas 表达式，用于识别此控制项适用的种子家庭或个人。用于创建这些表达式的家庭和个人字段应存在于种子表中。用户可能需要预处理种子样本以创建这些表达式所需的变量。这些表达式既可以用于离散变量，也可以用于连续变量。在大多数应用中，这涉及使用标准逻辑运算符（如 AND、OR、EQUAL、大于、小于等）创建逻辑关系（例如相等性、不等式和范围）。

Some conventions for writing expressions:
编写表达式的一些约定：

  * Each expression is applied to all rows in the table being operated upon.
  * Expressions must be vectorized expressions and can use most numpy and pandas expressions.
  * When editing the CSV files in Excel, use single quote ' or space at the start of a cell to get Excel to accept the expression

  * 每个表达式都应用于被操作表中的所有行。

  * 表达式必须是向量化的表达式，可以使用大多数 NumPy 和 Pandas 表达式。

  * 在 Excel 中编辑 CSV 文件时，在单元格开头使用单引号 ' 或空格，以使 Excel 能够接受该表达式。

.. _importance:

What are importance weights重要性权重是什么
~~~~~~~~~~~~~~~~~~~~~~~~~~~

PopulationSim uses the relative entropy maximization-based list balancing to match controls specified at various geographic levels. The relative entropy-based optimization ensures that the least amount of new information is introduced in finding a feasible solution. The base entropy is defined by the initial weights in the seed sample. The weights generated by the entropy maximization algorithm preserve the distribution of initial weights while matching the marginal controls. This ensures that the resulting weights are both uniform and preserves the distribution of the uncontrolled variables in the seed sample. A general relative entropy optimization problem is formulated as:
PopulationSim 采用基于相对熵最大化的列表平衡算法，以匹配在不同地理层级设定的控制项。基于相对熵的优化确保在寻找可行解时引入的新信息量最小。熵的基础由种子样本中的初始权重定义。熵最大化算法生成的权重在匹配边缘控制项的同时，能够保持初始权重的分布。这确保了最终得到的权重既具有均匀性，又保留了种子样本中非控制变量的分布。一般的相对熵优化问题表述如下：


:math:`\min\limits_{\rm x_{n}} \sum_{n}{x_{n}} ln\dfrac {x_{n}} {w_{n}}`

Where :math:`x_{n}` are the resulting household level weights所得到的家庭层级权重, :math:`x_{n}` are the initial weights初始权重. The marginal controls are specified as 边缘控制设置如下:

:math:`\sum_{n}{a_{in}*x_{n}} = A_{i}`

In PopulationSim, the hard marginal controls are relaxed by use of slack or relaxation factors in the constraints as shown below:
在PopulationSim中，通过在约束条件中引入松弛或放宽因子，将硬性边缘控制条件进行柔性化处理，具体如下所示：

:math:`\sum_{n}{a_{in}*x_{n}} = A_{i}*z_{i}`

Where, :math:`z_{i}` are relaxation factors松弛因子 and :math:`a_{in}` are incidence values that map household/person attribute to marginal controls将家庭/个人属性映射到边缘控制项的关联值. To ensure that marginal controls are not relaxed significantly, the relaxation factors are also included in the objective function with a penalty. With control relaxations, the relative entropy optimization problem is formulated as follows:
为确保边缘控制项不会被过度放宽，目标函数中也加入了针对放宽因子的惩罚项。引入控制放宽后，相对熵优化问题表述如下：

:math:`\min\limits_{\rm x_{n}, z_{i}} \sum_{n}{x_{n}} ln\dfrac {x_{n}} {w_{n}} + \sum_{i}{u_{i}*(z_{i}ln{z_{i}})}`

Where, :math:`u_{i}` are the penalties termed as importance factors or importance weights in PopulationSim 在PopulationSim中被称为重要性因子或重要性权重的惩罚项.

:math:`x_{n}` and :math:`z_{i}`  are the parameters solved by the optimization 通过求解得到的参数 while importance weights (:math:`u_{i}`) are the hyperparameters that are exposed to the user and impact the optimization externally暴露给用户或外部优化算法的超参数. The objective of the relative entropy optimization is to find a set of weights that are uniform and satisfy marginal controls. The importance weights allow the user to trade-off between these objectives. High importance weights (e.g., 1E10) on all controls result in a hard constrained optimization which gives a high preference to matching marginal controls. Low importance weights (e.g., <50) results in an almost unconstrained problem. The user may also specify different importance weights for each marginal control. In this case, the controls with higher importance weights are given preference over the ones with low importance weights. Therefore, both absolute and relative value of the importance weights impacts the optimization problem and the solution.
相对熵优化的目标是找到一组均匀且满足边缘控制项的权重。重要性权重允许用户在这两个目标之间进行权衡。所有控制项使用高重要性权重（例如 1E10）会导致硬约束优化，从而高度优先匹配边缘控制项。使用低重要性权重（例如 <50）则会导致几乎无约束的问题。用户还可以为每个边缘控制项指定不同的重要性权重。在这种情况下，重要性权重较高的控制项会优先于重要性权重较低的控制项。因此，重要性权重的绝对值和相对值都会影响优化问题及其解。

.. _setting-importance:

Setting importance weights 权重参数的配置
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Given the flexibility that importance weights offer to the user, they need to be tuned to get the desired optimality in the outputs for the given seed sample and marginal controls. The quality of the outputs is defined by a uniformity measure of the weights and goodness of fit across marginal controls. Here are general guidelines on setting importance weights:
鉴于重要性权重为用户提供的灵活性，需要对其进行调整，以便为给定的种子样本和边缘控制项获得期望的最优输出。输出质量由权重的均匀性度量以及跨边缘控制项的拟合优度来定义。以下是设置重要性权重的一般准则：

   * Start with a reasonable importance factor value across all controls (e.g., 1000 has typically worked well for multiple regions). This excludes the control on the total number of households which should be set to very high importance to ensure that the right number of households is generated for each zone.
    从所有控制项采用合理的重要性因子值开始（例如，1000 通常在多个区域中都表现良好）。这不包括对家庭总数的控制，该控制应设置为非常高的权重，以确保为每个区域生成正确数量的家庭。

   * After achieving reasonable goodness of fit across controls, the importance weights can be increased/decreased to favor one control over the other, or all importance weights can be reduced to improve the uniformity of the weights. Which controls to favor depends on the type of application and the quality of the marginal data.
    在实现跨控制项的合理拟合优度后，可以增加或减少重要性权重，以优先考虑某些控制项，或者可以降低所有权重以改善权重的均匀性。优先考虑哪些控制项取决于应用类型和边缘数据的质量。

   * The importance weights are generally updated in factors of 10. The user may need to run PopulationSim multiple times using various combinations of importance weights to reach the desired quality of outputs.
    重要性权重通常以 10 倍因子进行调整。用户可能需要使用不同重要性权重组合多次运行 PopulationSim，以达到期望的输出质量。


Error Handling & Debugging错误处理与调试
--------------------------

It is recommended to do appropriate checks on input data before running PopulationSim.  While the PopulationSim algorithm is designed to work even with imperfect data, an error-free and consistent set of input controls guarantees optimal performance. Poor performance and errors are usually the result of inconsistent data and it is the responsibility of the user to do necessary QA/QC on the input data. Some data problems that are frequently encountered are as follows:
建议在运行PopulationSim之前对输入数据进行适当的检查。虽然PopulationSim算法被设计为即使在数据不完美的情况下也能工作，但一套无误且一致的输入控制数据能确保最优的性能。性能不佳和错误通常是由数据不一致引起的，用户有责任对输入数据进行必要的质量保证和质量控制。以下是一些常见的数据问题
	* Miscoding of data
    * 数据编码错误
	* Inconsistent controls (for example, household-level households by size controls do not match person-level controls on total persons, or household-level workers per household controls do not match person-level workers by occupation)
    * 控制数据不一致（例如，按家庭规模统计的家庭层面控制数据与个人层面的总人口控制数据不匹配，或者家庭层面的每户工作者控制数据与个人层面的按职业划分的工作者控制数据不匹配）
	* Controls do not add to total number of households
    * 控制数据加总后与家庭总数不符
	* Controls do not aggregate consistently across geographies
	* 控制数据在不同地理层级上聚合不一致
	* Missing or mislabelled controls
    * 控制数据缺失或标签错误

