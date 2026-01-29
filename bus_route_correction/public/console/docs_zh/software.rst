.. PopulationSim documentation master file
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Software Implementation 软件应用
=======================

This page describes the PopulationSim software implementation and how to contribute to PopulationSim.
本页介绍了PopulationSim的软件实现以及如何为PopulationSim做出贡献。

The implementation starts with
the ActivitySim framework, which serves as the foundation for the software.  The framework, as briefly described
below, includes features for data pipeline management, expression handling, multiprocessing, testing, etc.  Built upon
the framework are additional core components for population synthesis such as balancers and integerizers.
Built upon the population synthesis core components are the model steps that make up a PopulationSim run,
such as the inputs pre-processor, setting up the data strucutres, doing the initial seed balancing, etc.
实现始于ActivitySim框架，该框架是软件的基础。该框架（简要描述如下）包括数据管道管理、表达式处理、多进程处理、测试等功能。在此框架之上，构建了用于人口合成的核心组件，如平衡器和整数化器。在人口合成核心组件之上，是构成PopulationSim运行的模型步骤，例如输入预处理器、数据结构设置、初始种子平衡等。

ActivitySim Framework ActivitySim框架
---------------------

PopulationSim is implemented in the `ActivitySim <https://github.com/activitysim/activitysim>`__
framework.  As summarized `here <https://activitysim.github.io/activitysim/#software-design>`__,
being implemented in the ActivitySim framework means:
PopulationSim 是基于 `ActivitySim <https://github.com/activitysim/activitysim>`__ 框架实现的。正如 此处 `<https://activitysim.github.io/activitysim/#software-design>`__ 所概述的，基于 ActivitySim 框架实现意味着：

* Overall Design 总体设计

  * Implemented in Python, and makes heavy use of the vectorized backend C/C++ libraries in `pandas <http://pandas.pydata.org>`__ and `numpy <http://www.numpy.org>`__. 基于Python，使用了pandas和numpy里的很多数组操作
  * Vectorization instead of for loops when possible  尽可能使用向量化操作而非循环。
  * Runs sub-models that solve Python expression files that operate on data tables
  * 运行子模型，这些子模型处理的是对数据表进行操作的Python表达式文件。


* Data Handling 数据处理

  * Inputs are in CSV format, with the exception of settings 除了配置文件以外其他输入都是csv格式
  * CSVs are read-in as pandas tables and stored in an intermediate HDF5 binary file that is used for data I/O throughout the model run
  * CSV文件作为pandas表读入，并存储在一个中间的HDF5二进制文件中，该文件在整个模型运行期间用于数据输入/输出。
  * Key outputs are written to CSV files 主要的输出均保存为csv文件

* Key Data Structures 主要数据结构

  * `pandas.DataFrame <http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.html>`__ - A data table with rows and columns, similar to an R data frame, Excel worksheet, or database table dataframe格式的数据列，不懂去搜百度
  * `pandas.Series <http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.html>`__ - a vector of data, a column in a DataFrame table or a 1D array 一个数据向量，即作为DataFrame表中的一列或一个一维数组。
  * `numpy.array <https://docs.scipy.org/doc/numpy/reference/generated/numpy.array.html>`__ - an N-dimensional array of items of the same type, such as a matrix 一个包含相同类型项目的N维数组，例如矩阵。

* Model Orchestrator模型编排器

  * `ORCA <https://github.com/UDST/orca>`__ is used for running the overall model system and for defining dynamic data tables, columns, and injectables (functions). ActivitySim wraps ORCA functionality to make a Data Pipeline tool, which allows for re-starting at any model step.
  * `ORCA <https://github.com/UDST/orca>`__ 用于运行整个模型系统，并用于定义动态数据表、列和可注入项（函数）。ActivitySim 封装了 ORCA 的功能，构建了一个数据管道工具，从而允许在任何模型步骤处重新启动。
  * Support for `multiprocessing <http://docs.python.org/3/library/multiprocessing.html>`_ to reduce runtime
  * 通过 `multiprocessing <http://docs.python.org/3/library/multiprocessing.html>`_ 的配置支持多线程

* Expressions 表达式

  * Model expressions are in CSV files and contain Python expressions, mainly pandas/numpy expression that operate on the input data tables. This helps to avoid modifying Python code when making changes to the model calculations.
  * 模型表达式存储在CSV文件中，并包含Python表达式（主要是基于pandas/numpy的表达式），这些表达式对输入数据表进行操作。这有助于在修改模型计算时避免改动Python代码

* `Code Documentation 代码文档 <https://activitysim.github.io/activitysim/development.html>`__

  * Python code according to `pycodestyle <https://pypi.python.org/pypi/pycodestyle>`__ style guide python编码
  * Written in `reStructuredText <http://docutils.sourceforge.net/rst.html>`__ markup, built with `Sphinx <http://www.sphinx-doc.org/en/stable>`__ and docstrings written in `numpydoc <https://github.com/numpy/numpy/blob/master/doc/HOWTO_DOCUMENT.rst.txt>`__
  * 帮助文档是用rst文件写的并翻译的，然后使用Sphinx编译成html文档

* `Testing测试 <https://activitysim.github.io/activitysim/development.html>`__

  * A protected master branch that can only be written to after tests have passed
  * 一个受保护的主分支，只有在所有测试通过后，才允许向其写入代码。
  * `pytest <https://docs.pytest.org/en/latest/>`__ for tests 提供测试
  * `TravisCI <https://travis-ci.org>`__ for building and testing with each commit 用于在每次代码提交时进行构建和测试。

PopulationSim also requires an optimization library for balancing and integerizing.  The software makes
use of the open source and easy to install `ortools <https://github.com/google/or-tools>`__ package.  The
ortools integerization results varies from platform to platform since edge case results depend on the
exact ortools/cbc version.
PopulationSim 还需要一个优化库来进行平衡和整数化处理。该软件使用了开源且易于安装的 `ortools <https://github.com/google/or-tools>`__ 包。由于边界情况的结果取决于确切的 ortools/cbc 版本，因此 ortools 整数化处理的结果在不同平台上可能会有所不同。

.. _core_components :

Core Components
---------------

assign
^^^^^^

.. automodule:: populationsim.assign
   :members:

balancer
^^^^^^^^

.. automodule:: populationsim.balancer
   :members:

integerizer
^^^^^^^^^^^

.. automodule:: populationsim.integerizer
   :members:

lp
^^

.. automodule:: populationsim.lp
   :members:

lp_cvx
^^^^^^

.. automodule:: populationsim.lp_cvx
   :members:

lp_ortools
^^^^^^^^^^

.. automodule:: populationsim.lp_ortools
   :members:

multi_integerizer
^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.multi_integerizer
   :members:

simul_balancer
^^^^^^^^^^^^^^

.. automodule:: populationsim.simul_balancer
   :members:

.. _model_steps :

Model Steps
-----------

.. _input_pre_processor :

input_pre_processor
^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.input_pre_processor
   :members:

.. _setup_data_structures :

setup_data_structures
^^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.setup_data_structures
   :members:

.. _initial_seed_balancing :

initial_seed_balancing
^^^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.initial_seed_balancing
   :members:

.. _meta_control_factoring :

meta_control_factoring
^^^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.meta_control_factoring
   :members:

.. _final_seed_balancing :

final_seed_balancing
^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.final_seed_balancing
   :members:

.. _integerize_final_seed_weights :


integerize_final_seed_weights
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.integerize_final_seed_weights
   :members:

.. _sub_balancing :

sub_balancing
^^^^^^^^^^^^^

.. automodule:: populationsim.steps.sub_balancing
   :members:

.. _expand_households :

expand_households
^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.expand_households
   :members:

.. _write_tables :

write_tables
^^^^^^^^^^^^

.. automodule:: populationsim.steps.write_tables
   :members:

.. _write_synthetic_population :

write_synthetic_population
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.write_synthetic_population
   :members:

.. _summarize :

summarize
^^^^^^^^^

.. automodule:: populationsim.steps.summarize
   :members:

.. _repop_balancing :

repop_balancing
^^^^^^^^^^^^^^^

.. automodule:: populationsim.steps.repop_balancing
   :members:

Contribution Guidelines
-----------------------

PopulationSim development follows the same `development guidelines <https://activitysim.github.io/activitysim/development.html>`__ as ActivitySim.
PopulationSim 的开发遵循与 ActivitySim 相同的 `开发指南 <https://activitysim.github.io/activitysim/development.html>`__ 。