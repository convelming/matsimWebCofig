.. PopulationSim 文档主文件
   你可以完全按照自己的喜好来修改此文件，但它至少
   应包含根 `toctree` 指令。

.. _getting_started:

快速开始
========

本页面介绍如何使用提供的示例来安装并运行 PopulationSim。

安装
----

1. 建议为你的系统安装并使用 *conda* 包管理器。
   一种简单的方式是使用 `Anaconda 64bit Python 3 <https://www.anaconda.com/distribution/>`__，
   不过你应当查阅该产品的 `服务条款 <https://www.anaconda.com/terms-of-service>`__
   并确认自己符合使用条件（截至 2021 年夏季，员工规模超过 200 人的企业和政府机构
   不符合免费使用资格）。如果你更倾向于完全免费的开源 *conda* 工具，
   可以下载并安装适合的 `Miniforge <https://github.com/conda-forge/miniforge#miniforge3>`__。

2. 如果你在防火墙之后访问互联网，则需要配置代理服务器。
   为此，请在 Anaconda 安装目录（例如 ``C:\ProgramData\Anaconda3``）
   中创建一个 .condarc 文件，例如：

::

  proxy_servers:
    http: http://myproxy.org:8080
    https: https://myproxy.org:8080
  ssl_verify: false

3. 创建并激活一个 Anaconda 环境（本质上是为本项目单独创建的一个 Python 环境）

::

  conda create -n popsim python=3.8

  # Windows
  activate popsim

  # Mac
  conda activate popsim

4. 在已激活的 conda Python 环境中获取并安装 PopulationSim 包：

::

  # 为了与 activitysim 保持一致性，最好使用 conda 版本的 pytables
  conda install pytables

  pip install populationsim


.. _activitysim :

ActivitySim
~~~~~~~~~~~

.. note::

  PopulationSim 是一个 64 位 Python 3 库，使用了大量科学计算生态中的软件包，
  其中最主要的是 `pandas <http://pandas.pydata.org>`__
  和 `numpy <http://numpy.org>`__。此外，它在很大程度上依赖于
  `ActivitySim <https://activitysim.github.io>`__ 包。

  获取科学 Python 安装环境的推荐方式是安装 64 位 Anaconda，
  其中包含了 ActivitySim 所依赖的许多库，以及一些方便的
  Python 安装管理工具。

  关于 Anaconda 和 ActivitySim 的更多信息，
  请参阅 ActivitySim 的 `快速开始
  <https://activitysim.github.io/activitysim/gettingstarted.html>`__ 指南。


运行示例
--------

PopulationSim 提供了四个运行示例，其中三个使用的是
美国俄勒冈州 Corvallis–Albany–Lebanon 建模区域（CALM）的数据，
另一个使用的是加拿大不列颠哥伦比亚省大温哥华地区的数据。

1. `example_calm`_ 示例运行 PopulationSim，
   以单进程方式为整个建模区域生成合成人口。

2. `example_calm_mp`_ 示例以
   `多进程 <http://docs.python.org/3/library/multiprocessing.html>`_
   方式运行 PopulationSim，
   通过在你的计算机上使用多个处理器同时进行平衡计算，
   为整个建模区域生成合成人口，从而缩短运行时间。

3. `example_calm_repop`_ 示例以 *repop* 模式运行 PopulationSim，
   用于更新区域中某一小部分的合成人口。

4. `example_survey_weighting`_ 示例用于生成家庭出行调查的最终权重。
   有关 PopulationSim 配置的更多信息，请参见
   **应用与配置（Application & Configuration）** 章节。

Example_calm
~~~~~~~~~~~~

按照以下步骤运行 **example_calm** 示例配置：

  * 在 example_calm 文件夹中打开命令提示符
  * 运行以下命令：

  ::

   activate popsim
   python run_populationsim.py

  * 查看 *output* 文件夹中的输出结果

Example_calm_mp
~~~~~~~~~~~~~~~

按照以下步骤运行 **example_calm_mp** 多进程示例配置：

  * 在 example_calm 文件夹中打开命令提示符
  * 在 ``configs_mp\setting.yaml`` 中，将 ``num_processes: 2``
    设置为适合你计算机的处理器数量
  * 运行以下命令：

  ::

   activate popsim
   python run_populationsim.py -c configs_mp -c configs

  * 查看 *output* 文件夹中的输出结果

Example_calm_repop
~~~~~~~~~~~~~~~~~~

repop 配置需要基准运行的输出结果。
因此，在运行 repop 配置之前，必须先运行基础配置。
按照以下步骤运行 **example_calm_repop** 示例配置：

  * 将 example_calm\\output 目录中的 **pipeline.h5** 文件
    复制到 example_calm_repop\\output 目录中
    （所有 PopulationSim 文件均存储在 pipeline.h5 文件中）
  * 在 example_calm_repop 文件夹中打开命令提示符
  * 运行以下命令：

  ::

   activate popsim
   python run_populationsim.py

  * 查看 *output* 文件夹中的输出结果

Example_survey_weighting
~~~~~~~~~~~~~~~~~~~~~~~~

按照以下步骤运行 **example_survey_weighting** 示例配置：

  * 在 example_survey_weighting 文件夹中打开命令提示符
  * 运行以下命令：

  ::

   activate popsim
   python run_populationsim.py

  * 查看 *output* 文件夹中的输出结果
