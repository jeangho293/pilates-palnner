import { Transform } from 'class-transformer';

/**
 * 쿼리스트링의 'true'/'false' 문자열을 boolean으로 변환하는 데코레이터.
 *
 * `@Type(() => Boolean)`은 `Boolean('false')`로 변환해 true가 되므로 쓰지 않는다.
 * 'true'/'false'가 아닌 값은 그대로 두어 `@IsBoolean`이 거르게 한다.
 *
 * @example
 * // ?isPublic=true  → true
 * // ?isPublic=false → false
 * // ?isPublic=abc   → 'abc' (@IsBoolean에서 400)
 * @ToBoolean()
 * @IsBoolean()
 * @IsOptional()
 * isPublic?: boolean;
 */
export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value));
}
