---
title: Agile Coretime
description: Explore the efficient scheduling mechanisms to access Polkadot cores to produce blockspace continuously or on-demand.
---

# Agile Coretime

Agile Coretime is the [scheduling](https://en.wikipedia.org/wiki/Scheduling_(computing)){target=\_blank} 
framework on Polkadot that lets parachains efficiently access cores, which comprise an 
active validator set tasked with parablock validation. Polkadot is the first blockchain to
enable such a flexible scheduling framework for producing blockspace. The cores can be designated
to a parachain continuously through [bulk coretime](#bulk-coretime) or [on-demand](#on-demand-coretime).
It is also possible to schedule multiple cores in parallel through elastic scaling, which is
a feature under active development on Polkadot. 

## Bulk Coretime

Bulk coretime is a fixed duration of continuous coretime represented by an NFT that can be 
purchased through [coretime sales](#coretime-sales) in DOT and can be split, shared, or 
resold. Currently, the duration of bulk coretime is set to 28 days. Coretime purchased in bulk and assigned to a single parachain
is eligible for a price-capped renewal, providing a form of rent controlled access which is 
important for predicting the running costs in the near future. If the bulk coretime is 
[interlaced](#coretime-interlacing) or [split](#coretime-splitting) or is kept idle without
assigning it to parachain, it will be ineligible for for the price-capped renewal.

### Coretime Interlacing

It is the action of dividing bulk coretime across multiple parachains that produce blocks
spaced uniformly in time. For example, think of multiple parachains taking turns to produce 
blocks which demonstrates a simple form of interlacing. This feature can be used by parachains
that have a low volume of transactions and need not produce blocks continuously.

### Coretime Splitting

It is the action of dividing bulk coretime into multiple contiguous regions. This feature can 
be used by parachains that need to produce blocks continuously, but do not require the whole 
28 days of bulk coretime and require only part of it.

## On-demand Coretime

Polkadot has dedicated cores assigned for providng coretime on-demand. These cores are excluded
from the coretime sales and are reserved for on-demand parachains, which pay in DOT per block. 

## Coretime Sales



## Coretime Marketplaces
