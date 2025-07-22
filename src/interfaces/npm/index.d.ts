import jwt from '@types/jsonwebtoken';
import jsonschema from '@types/json-schema';
import utils from 'naughty-util';
import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';

declare global {
  interface Npm {
    dotenv: typeof dotenv;
    express: typeof express;
    'naughty-util': typeof utils;
    pg: typeof pg;
    jwt: typeof jwt;
    jsonschema: typeof jsonschema;
  }
}

export {};
