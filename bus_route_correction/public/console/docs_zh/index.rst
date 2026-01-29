.. PopulationSim documentation master file
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Introduction 简介
=============

PopulationSim is an open platform for population synthesis and survey weighting.  It emerged from
`Oregon DOT <https://www.oregon.gov/odot>`_'s desire to build a shared, open, platform that could
be easily adapted for statewide, regional, and urban transportation planning needs.
PopulationSim 是一个用于人口合成与调查加权的开放平台。它的诞生源于俄勒冈州交通局希望构建一个共享、开放的平台，以便轻松适应全州、区域及城市交通规划的需求。

What is population synthesis? 什么是合成人口？
-----------------------------
Activity based travel demand models such as `ActivitySim <http://www.activitysim.org>`_ operate at an individual
level, wherein the travel choices of person and household decision-making agents are predicted by applying
Monte Carlo methods to behavioral models. This requires a data set of households and persons representing
the entire population in the modeling region. Population synthesis refers to the process used to create this data.
基于活动的交通需求模型（例如 ActivitySim <http://www.activitysim.org>_）在个体层面运行，通过将蒙特卡洛方法应用于行为模型来预测个人和家庭决策代理的出行选择。这需要一个代表建模区域全体人口的家庭和个人数据集。人口合成即指用于创建此数据集的过程。

The required inputs to population synthesis are a population sample and marginal distributions (or control totals).
The population sample is commonly referred to as the *seed or reference sample* and the marginal distributions are
commonly referred to as *controls or targets*. **The process of expanding the seed sample to match the marginal
distribution is termed population synthesis.** The software tool which implements this population synthesis process
is termed as a **Population Synthesizer**.
人口合成所需的输入包括人口样本和边缘分布。人口样本通常称为种子样本或参考样本，而边缘分布通常称为控制数据或目标数据。将种子样本进行扩展以匹配边缘分布的过程，即称为人口合成。 实现此人口合成过程的软件工具称为人口合成器。

What does a Population Synthesizer produce? 人口合成的生成了啥？
-------------------------------------------
The objective of a population synthesizer is to generate a synthetic population for
a modeling region. The main outputs from a population synthesizer include tables of persons and households
representing the entire population of the modeling region. These tables also include household and person-level
attributes of interest. Examples of attributes at the household level include household income, household size, housing
type, and number of vehicles. Examples of person attributes include
age, gender, work\school status, and occupation. Depending on the use case, a population synthesizer may also
produce multi-way distribution of demographic variables at different geographies to be used as an input
to aggregate (four-step) travel models. In the case of PopulationSim specifically, an additional option is also included to
modify an existing regional synthetic population for a smaller geographical area. In this case, the outputs are a modified
set of persons and households.
人口合成器的目标是为建模区域生成一个合成人口。其主要输出包括代表建模区域全体人口的家庭表和个人表，这些表中还包含了关注的家庭及个人层面的属性特征。家庭层面的属性示例如：家庭收入、家庭规模、住房类型、车辆数量；个人层面的属性示例如：年龄、性别、工作/在校状态、职业。根据具体用例，人口合成器还可能生成不同地理层级上人口统计变量的多维分布，用作聚合式（四阶段）交通模型的输入。具体到PopulationSim，它还包含一项额外功能，即针对较小地理区域修改现有的区域合成人口。在这种情况下，其输出是一组经过修改的个人和家庭数据。

How does a population synthesizer work? 人口合成是如何工作的
---------------------------------------
The main inputs to a population synthesizer are disaggregate population samples and marginal control
distributions. In the United States, the disaggregate population sample is typically obtained from the `Census Public Use
Microdata Sample (PUMS) <https://www.census.gov/programs-surveys/acs/microdata.html>`_, but other sources, such as a household
travel survey, can also be used. The seed sample should include demographic variables corresponding to each marginal control
termed as *controlled variables* (e.g., household size, household income, etc.). The seed sample could also include other
variables of interest but not necessarily controlled via marginal controls. These are termed as *uncontrolled variables*.
The seed sample should also include an initial weight on each household record.
人口合成器的主要输入是细粒度的人口样本和边缘控制分布。在美国，细粒度人口样本通常来自美国人口普查局的公共使用微观数据样本，但也可使用其他来源，例如家庭出行调查。种子样本应包含与每个边缘控制变量（称为控制变量，例如家庭规模、家庭收入等）对应的人口统计变量。种子样本还可以包含其他关注但未必通过边缘控制进行控制的变量，这些被称为非控制变量。种子样本还应包含每个家庭记录的初始权重。

Current year marginal distributions of person and household-level attributes of interest are available from Census. For
future years, marginal distributions are either held constant, or forecasted.  Marginal distributions can be for both
household or person level variables and are specified at a specific geography (e.g., Block Groups, Traffic Analysis Zone
or County). PopulationSim allows controls to be specified at multiple geographic levels.
当前年份关注的人员及家庭层面属性的边缘分布可从人口普查数据获取。对于未来年份，边缘分布可以保持不变，或进行预测。边缘分布既可针对家庭变量，也可针对个人变量，并在特定的地理层级（例如区块组、交通分析小区或县）上指定。PopulationSim允许在多个地理层级上指定控制数据。

The objective of a population synthesizer is to generate household weights which satisfies the marginal control
distributions. This is achieved by use of a data fitting technique. The most common fitting technique used by various
population synthesizers is the Iterative Proportional Fitting (IPF) procedure. Generally, the IPF procedure is used
to obtain joint distributions of demographic  variables. Then, random sampling from PUMS generates the baseline synthetic
population.
人口合成器的目标是生成满足边缘控制分布的家庭权重。这通过使用数据拟合技术实现。最常用的拟合技术是迭代比例拟合。IPF通常用于获取人口统计变量的联合分布，然后通过从PUMS中随机抽样生成基线合成人口。

One of the limitations of the simple IPF method is that it does not incorporate both household and person
level attributes simulatenously. Some population synthesizers use a heuristic algorithm called the
Iterative Proportional Updating Algorithm (IPU) to incorporate both person and household-level variables in the fitting procedure.
简单IPF方法的一个局限性是无法同时纳入家庭和个人层面的属性。一些人口合成器使用一种称为迭代比例更新算法的启发式算法，以在拟合过程中同时纳入个人和家庭层面的变量。

Besides IPF, entropy maximization algorithms have been used as a fitting technique. In most of the entropy based methods,
the relative entropy is used as the objective function. The relative entropy based optimization ensures
that the least amount of new information is introduced in finding a feasible solution. The base entropy
is defined by the initial weights in the seed sample. The weights generated by the entropy maximization
algorithm preserves the distribution of initial weights while matching the marginal controls. This is an
advantage of the entropy maximization based procedures over the IPF based procedures. PopulationSim uses the entropy maximization
based list balancing to match controls specified at various geographic levels.

除了IPF，熵最大化算法也被用作一种拟合技术。在大多数基于熵的方法中，使用相对熵作为目标函数。基于相对熵的优化确保在寻找可行解时引入的新信息量最小。熵的基础由种子样本中的初始权重定义。熵最大化算法生成的权重在匹配边缘控制项的同时，能保持初始权重的分布。这是基于熵最大化的方法相比基于IPF方法的一个优势。PopulationSim采用基于熵最大化的列表平衡算法来匹配在不同地理层级设定的控制项。

Once the final weights have been assigned, the seed sample is expanded using these weights to generate a synthetic population. Most
population synthesizers create distributions using final weights and employ random sampling to expand the
seed sample. PopulationSim uses Linear Programming to convert the final weights to integer values and expands
the seed sample using these integer weights. For detailed description of PopulationSim algorithm, please refer to the TRB paper
link in the :ref:`docs` section. For information on software implementation refer to :ref:`core_components` and :ref:`model_steps`. To
learn more about PopulationSim application and configuration, please follow the content index below.
一旦分配好最终权重，即可使用这些权重扩展种子样本以生成合成人口。大多数人口合成器会使用最终权重创建分布，并采用随机抽样来扩展种子样本。而PopulationSim则使用线性规划将最终权重转换为整数值，并利用这些整数权重扩展种子样本。有关PopulationSim算法的详细说明，请参阅 :ref:docs 部分中的TRB论文链接。关于软件实现的信息，请参考 :ref:core_components 和 :ref:model_steps。要了解更多关于PopulationSim应用和配置的内容，请遵循下面的内容索引。


How does population synthesis work for survey weighting?
--------------------------------------------------------
PopulationSim can also be used to solve the household travel survey weighting problem of developing final weights.  Travel surveys typically
include a set of initial household weights based on the sampling plan.  Often the initial weights are revised to match a set of control totals
that describe the overall survey population.  This exercise is like population synthesis, except that the geographic allocation of households is
not needed because household locations are surveyed and not synthesized.
PopulationSim 也可用于解决家庭出行调查中的权重制定问题，即计算最终权重。出行调查通常基于抽样方案包含一组初始家庭权重。这些初始权重常常需要根据描述总体调查人口的一组控制总量进行修订。这项任务类似于人口合成，但不同之处在于不需要进行家庭的地理分配，因为家庭位置是通过调查而非合成获得的。

Contents
--------

.. toctree::
   :maxdepth: 2

   getting_started
   application_configuration
   validation
   software
   docs


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
